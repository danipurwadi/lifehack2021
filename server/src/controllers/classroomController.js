const express = require('express');
const mongoose = require('mongoose');
const Types = mongoose.Types;
const Classroom = require('../models/classroom');
const User = require('../models/user');
const Assignment = require('../models/assignment');
const isEmpty = require('is-empty');

const classroomController = {
    getClass(req, res, next) {
        Classroom.findById(req.params.classId)
            .then((c) => {
                if (classroomController != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(c);
                } else {
                    let err = new Error(
                        'Class ' + req.params.classId + ' not found!'
                    );
                    res.statusCode = 404;
                    return next(err);
                }
            })
            .catch((err) => next(err));
    },

    postClass(req, res) {
        console.log('sefe');
        if (!req.body.subject) {
            return res.status(400).send({
                message: 'Subject cannot be empty'
            });
        }

        if (req.user.userType != 'Teacher') {
            return res.status(400).send({
                message: 'You are not authorized to create a class!'
            });
        }
        const c = new Classroom(req.body);
        c.save()
            .then((data) => {
                const toUpdate = [...c.students];
                toUpdate.push(c.teacher);
                User.updateMany(
                    { _id: { $in: toUpdate } },
                    {
                        $addToSet: {
                            classrooms: c._id
                        }
                    }
                )
                    .then(() => {
                        res.send(data);
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message:
                                err.message ||
                                'Some error occurred while creating the Class.'
                        });
                    });
            })
            .catch((err) => {
                res.status(500).send({
                    message:
                        err.message ||
                        'Some error occurred while creating the Class.'
                });
            });
    },

    updateClass(req, res) {
        if (req.user.userType != 'Teacher') {
            return res.status(400).send({
                message: 'You are not authorized to update a class!'
            });
        }

        Classroom.findByIdAndUpdate(
            req.params.classId,
            {
                $set: req.body
            },
            { new: true }
        )
            .then((c) => {
                if (!c) {
                    return res.status(404).send({
                        message: 'Class not found with id ' + req.params.classId
                    });
                }

                if (c.teacher.equals(req.user._id)) {
                    if (!isEmpty(req.body.students)) {
                        console.log(c.assignments);
                        const assignmentStatus = c.assignments.map((assign) => {
                            return { assignmentId: assign._id };
                        });
                        console.log(assignmentStatus);
                        User.updateMany(
                            { _id: { $in: req.body.students } },
                            {
                                $addToSet: {
                                    classrooms: Types.ObjectId(
                                        req.params.classId
                                    ),
                                    assignments: assignmentStatus
                                }
                            }
                        )
                            .then(() => {
                                res.statusCode = 200;
                                res.setHeader(
                                    'Content-Type',
                                    'application/json'
                                );
                                res.json(c);
                                return;
                            })
                            .catch((err) => {
                                if (err.kind === 'ObjectId') {
                                    return res.status(404).send({
                                        message:
                                            'Please enter the appropriate Object id'
                                    });
                                }

                                return res.status(500).send({
                                    message:
                                        'Error updating class with id ' +
                                        req.params.classId
                                });
                            });
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(c);
                    }
                } else {
                    return res.status(400).send({
                        message: 'You are not authorized to update this class!'
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.kind === 'ObjectId') {
                    return res.status(404).send({
                        message: 'Please enter the appropriate Object id'
                    });
                }
                return res.status(500).send({
                    message:
                        'Error updating class with id ' + req.params.classId
                });
            });
    },

    deleteClass(req, res, next) {
        if (req.user.userType != 'Teacher') {
            return res.status(400).send({
                message: 'You are not authorized to delete a class!'
            });
        }

        Classroom.findById(req.params.classId)
            .then((c) => {
                if (!c) {
                    return res.status(404).send({
                        message: 'Class not found with id ' + req.params.classId
                    });
                }
                if (c.teacher.equals(req.user._id)) {
                    const toDel = [...c.students];
                    toDel.push(req.user._id);
                    const assignmentIds = c.assignments.map(
                        (assignment) => assignment._id
                    );

                    User.updateMany(
                        { _id: { $in: toDel } },
                        {
                            $pull: {
                                classrooms: req.params.classId,
                                assignments: { assignmentId: assignmentIds }
                            }
                        }
                    )
                        .then(() => {
                            Assignment.deleteMany({
                                _id: { $in: assignmentIds }
                            })
                                .then(() => {
                                    Classroom.findByIdAndRemove(
                                        req.params.classId
                                    ).then(() => {
                                        res.statusCode = 200;
                                        res.setHeader(
                                            'Content-Type',
                                            'application/json'
                                        );
                                        res.json(
                                            'Classroom deleted successfully!'
                                        );
                                    });
                                })
                                .catch((err) => next(err));
                        })
                        .catch((err) => next(err));
                } else {
                    return res.status(400).send({
                        message: 'You are not authorized to delete this class!'
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                    return res.status(404).send({
                        message: 'Class not found with id ' + req.params.classId
                    });
                }
                return res.status(500).send({
                    message:
                        'Could not delete class with id ' + req.params.classId
                });
            });
    }
};

module.exports = classroomController;
