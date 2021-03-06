var express = require("express");
var router = express.Router();

var email_service = require("./../service/email.service");

////

router.get(
  "/all/student-latest-application",
  sendStudentLatestApplicationEmail
);
router.get("/student-full-details", sendAllStudentsLatestDetailsViaEmail);
router.get("/approved-agencies", sendApprovedAgenciesEmail);
router.get("/all-agencies", sendAllAgenciesViaEmail);
router.get(
  "/student_with_study_commenced_application",
  sendStudentsWithStudyCommencedCourseApplication
);
router.get("/institution", sendInstitutionViaEmail);

//////

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function sendStudentsWithStudyCommencedCourseApplication(req, res, next) {
  try {
    const data = await email_service.sendStudentsWithStudyCommencedCourseApplication();
    res.setHeader(
        "Content-disposition",
        `attachment; filename="test.csv"`
      );
      res.set("Content-Type", "text/csv");
      res.status(200).send(data);
  } catch (err) {
    console.log("error", err);
    res.send(err);
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function sendStudentLatestApplicationEmail(req, res, next) {
  let per_hr = 0;
  email_service.sendStudentLatestApplicationViaEmail(per_hr).then(
    csv_raw_data =>
      sendAsCSV(
        res,
        `students-latest-application-within-${per_hr}-hr`,
        csv_raw_data
      ),
    err => {
      console.log("error", err);
      res.send(err);
    }
  );
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function sendAllStudentsLatestDetailsViaEmail(req, res, next) {
  email_service.sendAllStudentsLatestDetailsViaEmail().then(
    csv_raw_data => sendAsCSV(res, "student-report", csv_raw_data),
    err => {
      console.log("error", err);
      res.send(err);
    }
  );
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function sendApprovedAgenciesEmail(req, res, next) {
  email_service.sendLatestApprovedAgenciesViaEmail().then(
    csv_raw_data => sendAsCSV(res, "approved-agencies", csv_raw_data),
    err => {
      console.log("error", err);
      res.send(err);
    }
  );
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function sendAllAgenciesViaEmail(req, res, next) {
  email_service.sendAllAgenciesViaEmail().then(
    csv_raw_data => sendAsCSV(res, "all-agencies", csv_raw_data),
    err => {
      console.log("error", err);
      res.send(err);
    }
  );
}

/**
 *
 * @param {*} res
 * @param {*} csv_data
 */
function sendAsCSV(res, prefix_name, csv_data) {
  let csv_file_name = `${prefix_name}-test-${new Date().getTime()}.csv`;
  res.setHeader(
    "Content-disposition",
    `attachment; filename="${csv_file_name}"`
  );
  res.set("Content-Type", "text/csv");
  res.status(200).send(csv_data);
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
function sendInstitutionViaEmail(req, res, next) {
  email_service.sendInstitutionList().then(
    csv_raw_data => sendAsCSV(res, "institution", csv_raw_data),
    err => {
      console.log("error", err);
      res.send(err);
    }
  );
}

module.exports = router;
