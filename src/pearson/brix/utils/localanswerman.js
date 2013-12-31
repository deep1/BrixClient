/* **************************************************************************
 * $Workfile:: localanswerman.js                                            $
 * *********************************************************************/ /**
 *
 * @fileoverview Client-side answer evaluation engine object.
 *
 * The LocalAnswerMan engine does simple comparisons between its record
 * of an item's data and whether the submitted answer is correct or not.
 *
 * It is an AnswerMan which works client-side and can be used for testing
 * and demo pages.
 *
 * Created on       November 14, 2013
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2013 Pearson, All rights reserved.
 *
 * **************************************************************************/

goog.provide('pearson.brix.utils.LocalAnswerMan');

goog.require('pearson.brix.utils.IAnswerMan');
goog.require('goog.object');

/* **************************************************************************
 * LocalAnswerMan                                                      */ /**
 *
 * The LocalAnswerMan is a correctness engine which uses a local database of
 * answer keys to determine if a given answer is correct.
 *
 * @constructor
 * @implements {pearson.brix.utils.IAnswerMan}
 *
 **************************************************************************/
pearson.brix.utils.LocalAnswerMan = function ()
{
    /**
     * The maximum attempts allowed. If null unlimited attempts are
     * allowed. This value is used to return the correct answer in the
     * score response when the last attempt allowed is incorrect.
     * @type {?number}
     */
    this.maxAttempts_ = null;

    /**
     * Database of registered answer keys, indexed by sequenceNodeKey
     * @private
     * @type {Object.<string, !pearson.brix.utils.AnswerKey>}
     */
    this.answerKeyDB_ = {};
};

/* **************************************************************************
 * LocalAnswerMan.setMaxAttempts                                       */ /**
 *
 * Set the maximum number of attempts this LocalAnswerMan will use where
 * relevant.
 *
 * @param {number}	maxAttempts     -The number of maximum scoring attempts
 *                                   allowed. This really only affects whether
 *                                   the correct answer will be returned along
 *                                   w/ the incorrect answer feedback.
 *
 ****************************************************************************/
pearson.brix.utils.LocalAnswerMan.prototype.setMaxAttempts = function (maxAttempts)
{
   this.maxAttempts_ = maxAttempts;
};

/* **************************************************************************
 * LocalAnswerMan.registerAnswerKey                                    */ /**
 *
 * Register the answer key to use for a particular question (assessment)
 * identified by the given seqNodeKey that will be used to evaluate the
 * correctness and determine the feedback for any particular answer to
 * the question when it is scored.
 *
 * @param {string}  seqNodeKey  -The sequence node key that identifies the question
 *                               being scored.
 * @param {!pearson.brix.utils.AnswerKey}
 *                  answerKey   -The answer key for the question (assessment)
 *                               identified by the given seqNodeKey, that will
 *                               be used to evaluate any particular answer to
 *                               the question.
 *
 ****************************************************************************/
pearson.brix.utils.LocalAnswerMan.prototype.registerAnswerKey = function (seqNodeKey, answerKey)
{
    // Create a copy of the answer key object that can be modified
    var answerKeyPlus = {};
    goog.object.extend(answerKeyPlus, answerKey);
    answerKeyPlus.attemptsMade = 0;
    this.answerKeyDB_[seqNodeKey] = answerKeyPlus;
};

/* **************************************************************************
 * LocalAnswerMan.scoreAnswer                                          */ /**
 *
 * Score (determine the correctness) of a student's answer to a question and
 * return feedback.
 *
 * @param {string}  seqNodeKey      -The sequence node key that identifies the question
 *                                   being scored.
 * @param {Object}  studentAnswer   -The student's answer to the question.
 * @param {function(pearson.brix.utils.ScoreResponse)}
 *                  callback        -Callback function to be invoked w/ the
 *                                   correctness feedback from scoring the given
 *                                   answer.
 ****************************************************************************/
pearson.brix.utils.LocalAnswerMan.prototype.scoreAnswer = function (seqNodeKey, studentAnswer, callback)
{
    // Make sure we have an answer key for the seqNodeKey
    if (!(seqNodeKey in this.answerKeyDB_))
    {
        throw Error("The answer key for '" + seqNodeKey + "' has not been registered, so it cannot be scored.");
    }

    var answerKey = this.answerKeyDB_[seqNodeKey];
    var assessmentType = answerKey['assessmentType'];

    // Make sure we've got an evaluator for the question type
    if (!(assessmentType in pearson.brix.utils.LocalAnswerMan.evaluateAnswer))
    {
        throw Error("There is no evaluator for an assessment type of '" + assessmentType);
    }

    var evaluator = pearson.brix.utils.LocalAnswerMan.evaluateAnswer[assessmentType];

    var response = evaluator(studentAnswer, answerKey['answers']);
    ++answerKey.attemptsMade;
    response['attemptsMade'] = answerKey.attemptsMade;

    if (response['correctness'] !== 1 && this.maxAttempts_ != null && answerKey.attemptsMade >= this.maxAttempts_)
    {
        var getCorrectAnswer = pearson.brix.utils.LocalAnswerMan.getCorrectAnswer[assessmentType];
        response['correctAnswer'] = getCorrectAnswer(answerKey['answers']);
    }

    callback(response);
};


/**
 * The types of questions.
 * @enum {string}
 */
pearson.brix.utils.QuestionTypes =
{
    ALWAYSCORRECT:  "alwayscorrect",
    MULTIPLECHOICE: "multiplechoice",
    MULTISELECT:    "multiselect",
    NUMERIC:        "numeric"
};

/**
 * Functions to evaluate the various types of answers.
 * @type {Object.<pearson.brix.utils.QuestionTypes, function(Object, !pearson.brix.utils.AnswerKey):pearson.brix.utils.ScoreResponse>}
 */
pearson.brix.utils.LocalAnswerMan.evaluateAnswer =
{
    /* **************************************************************************
     * evaluateAnswer.alwayscorrect                                        */ /**
     *
     * Function which evaluates the answer to always be correct.
     *
     * @param {Object}  answer      -the answer submitted by the student to be evaluated.
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                              -the object which describes the question and
     *                               its solution. For an always correct question
     *                               its contents are irrelevant.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'alwayscorrect': function(answer, questionSolution)
    {
        return { "correctness": 1, "feedback": null };
    },

    /* **************************************************************************
     * evaluateAnswer.multiplechoice                                       */ /**
     *
     * Function which evaluates the answer to a multiple choice question.
     *
     * @param {Object}  answer      -the multiple choice answer submitted by the
     *                               student to be evaluated.
     * @param {string}  answer.key  -the key of the choice selected by the student.
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                              -the object which describes the question and
     *                               its solution. For a multiple choice question
     *                               it contains a property for each choice which
     *                               specifies the result for selecting that choice.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'multiplechoice': function(answer, questionSolution)
    {
        var chosenKey = answer['key'];

        if (chosenKey in questionSolution)
        {
            var solution = questionSolution[chosenKey];
            return { "correctness": solution['score'], "feedback": solution['response'] };
        }

        return { "correctness": null, "feedback": 'Something went awry, your answer was unexpected.' };
    },

    /* **************************************************************************
     * evaluateAnswer.numeric                                              */ /**
     *
     * Function which evaluates the answer to a numeric question.
     *
     * @param {Object}  answer          -the numeric answer submitted by the
     *                                   student to be evaluated.
     * @param {string}  answer.value    -the numeric answer entered by the student.
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                                  -the object which describes the question and
     *                                   its solution. For a numeric question
     *                                   it contains the correct numeric answer as
     *                                   well as an acceptable error by which the
     *                                   student's answer may vary from the correct answer
     *                                   and still be considered correct.
     *                                   It also contains a response for a correct answer
     *                                   and for an incorrect answer.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'numeric': function(answer, questionSolution)
    {
        // assert that answer.type === "numeric"

        // Assume answer is incorrect
        var result = { "correctness": 0,
                       "feedback": questionSolution['incorrectResponse'] };

        var correctValue = questionSolution['correctValue'];
        var acceptableError = questionSolution['acceptableError'];

        // if answer is correct, update result to reflect that
        if (answer.value >= correctValue - acceptableError &&
            answer.value <= correctValue + acceptableError)
        {
            result['correctness'] = 1;
            result['feedback'] = questionSolution['correctResponse'];
        }

        return result;
    },

    /* **************************************************************************
     * evaluateAnswer.multiselect                                          */ /**
     *
     * Function which evaluates the answer to a numeric question.
     *
     * @param {Object}  answer          -the multiple choices selected by the
     *                                   student to be evaluated.
     * @param {!Array.<string>}
     *                  answer.keys     -list of keys of the choices selected by
     *                                   the student.
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                                  -the object which describes the question and
     *                                   its solution. For a multiselect question
     *                                   it contains SOMETHING that hasn't been defined
     *                                   yet, but should be similar to the solutions
     *                                   of other question types. -mjl
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'multiselect': function(answer, questionSolution)
    {
        // assert that answer.type === "multiselect"

        // Assume answer is incorrect
        var result = { "correctness": 0,
                       "feedback": questionSolution['incorrectResponse'] };

        // if answer is correct, update result to reflect that
        // Don't know how to do that yet as the solution structure hasn't been defined.

        return result;
    },
};

/**
 * Functions to get the correct answer from the various types of answerKeys.
 * @type {Object.<pearson.brix.utils.QuestionTypes, function(!pearson.brix.utils.AnswerKey):pearson.brix.utils.ScoreResponse>}
 */
pearson.brix.utils.LocalAnswerMan.getCorrectAnswer =
{
    /* **************************************************************************
     * getCorrectAnswer.alwayscorrect                                      */ /**
     *
     * Function which returns the correct answer from an alwayscorrect answerKey.
     * This is never a valid call, as all answers are correct, and the structure
     * of the answerKey is irrelevant and hence unknown.
     *
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                              -the object which describes the question and
     *                               its solution. For an always correct question
     *                               its contents are irrelevant.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'alwayscorrect': function(questionSolution)
    {
        throw Error('There should never be the need to request the correct answer of an alwayscorrect answerKey');
    },

    /* **************************************************************************
     * getCorrectAnswer.multiplechoice                                     */ /**
     *
     * Function which gets the correct answer for a multiple choice question.
     *
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                              -the object which describes the question and
     *                               its solution. For a multiple choice question
     *                               it contains a property for each choice which
     *                               specifies the result for selecting that choice.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'multiplechoice': function(questionSolution)
    {
        for (var key in questionSolution)
        {
            var keyObj = questionSolution[key];
            if (keyObj['score'] === 1)
            {
                // don't bother returning the score, it should be 1.
                return { "key": key, "feedback": keyObj['response'] };
            }
        }

        return { "key": null, "feedback": 'Something went awry, there is no correct answer.' };
    },

    /* **************************************************************************
     * getCorrectAnswer.numeric                                            */ /**
     *
     * Function which evaluates the answer to a numeric question.
     *
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                                  -the object which describes the question and
     *                                   its solution. For a numeric question
     *                                   it contains the correct numeric answer as
     *                                   well as an acceptable error by which the
     *                                   student's answer may vary from the correct answer
     *                                   and still be considered correct.
     *                                   It also contains a response for a correct answer
     *                                   and for an incorrect answer.
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'numeric': function(questionSolution)
    {
        return { "value": questionSolution['correctValue'],
                 "feedback": questionSolution['correctResponse'] };
    },

    /* **************************************************************************
     * getCorrectAnswer.multiselect                                        */ /**
     *
     * Function which evaluates the answer to a numeric question.
     *
     * @param {!pearson.brix.utils.AnswerKey}
     *                  questionSolution
     *                                  -the object which describes the question and
     *                                   its solution. For a multiselect question
     *                                   it contains SOMETHING that hasn't been defined
     *                                   yet, but should be similar to the solutions
     *                                   of other question types. -mjl
     *
     * @returns {pearson.brix.utils.ScoreResponse}
     *
     ****************************************************************************/
    'multiselect': function(questionSolution)
    {
        throw Error("Determining the correct answer of a multiselect has not been implmeented");
    },
};

