"""Database security regression tests; credentials are supplied through environment.

Run: python3 -m unittest discover -s tests -p security_regression.py -v
Requires TEST_API_URL, TEST_API_KEY, TEST_ADMIN_TOKEN, TEST_ADMIN_ID,
TEST_STUDENT_TOKEN and TEST_STUDENT_ID. Never prints tokens or response bodies.
"""
import json
import os
import unittest
import urllib.error
import urllib.parse
import urllib.request
import uuid


def api(path, token=None, method="GET", data=None):
    headers = {"apikey": os.environ["TEST_API_KEY"], "Content-Type": "application/json",
               "Prefer": "return=representation"}
    if token:
        headers["Authorization"] = "Bearer " + token
    req = urllib.request.Request(os.environ["TEST_API_URL"] + path,
                                 data=None if data is None else json.dumps(data).encode(),
                                 headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read()
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as error:
        return error.code, None


class SecurityRegression(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.admin = os.environ["TEST_ADMIN_TOKEN"]
        cls.student = os.environ["TEST_STUDENT_TOKEN"]
        cls.student_id = os.environ["TEST_STUDENT_ID"]
        cls.marker = "Security regression " + str(uuid.uuid4())
        status, lessons = api("/rest/v1/lessons?select=id&limit=1", cls.admin)
        assert status == 200 and lessons, "A real lesson is required"
        cls.lesson = lessons[0]["id"]

    def tearDown(self):
        # Delete only this run's fixtures, never real community records.
        for table in ("lesson_comments", "prayer_requests"):
            api("/rest/v1/" + table + "?select=id&body=eq." + urllib.parse.quote(self.marker),
                self.admin, "DELETE")

    def comment(self, **extra):
        return {"lesson_id": self.lesson, "user_id": self.student_id,
                "display_name": "Security test", "body": self.marker, **extra}

    def test_student_cannot_insert_approved_comment(self):
        status, _ = api("/rest/v1/lesson_comments", self.student, "POST",
                        self.comment(status="approved"))
        self.assertEqual(status, 403)

    def test_moderator_can_approve_a_pending_comment(self):
        status, rows = api("/rest/v1/lesson_comments", self.student, "POST", self.comment())
        self.assertEqual(status, 201)
        path = "/rest/v1/lesson_comments?id=eq." + rows[0]["id"]
        status, _ = api(path, os.environ["TEST_MODERATOR_TOKEN"], "PATCH", {"status": "approved"})
        self.assertEqual(status, 200)
        self.assertEqual(api(path)[1][0]["status"], "approved")

    def test_student_cannot_approve_own_pending_comment(self):
        status, rows = api("/rest/v1/lesson_comments", self.student, "POST", self.comment())
        self.assertEqual(status, 201)
        comment_id = rows[0]["id"]
        self.assertEqual(rows[0]["status"], "pending")
        status, _ = api("/rest/v1/lesson_comments?id=eq." + comment_id,
                        self.student, "PATCH", {"status": "approved"})
        self.assertEqual(status, 403)
        _, rows = api("/rest/v1/lesson_comments?id=eq." + comment_id, self.student)
        self.assertEqual(rows[0]["status"], "pending")
        _, public = api("/rest/v1/lesson_comments?id=eq." + comment_id)
        self.assertEqual(public, [])
        status, _ = api("/rest/v1/lesson_comments?id=eq." + comment_id,
                        self.admin, "PATCH", {"status": "approved"})
        self.assertEqual(status, 200)
        _, public = api("/rest/v1/lesson_comments?id=eq." + comment_id)
        self.assertEqual(public[0]["status"], "approved")

    def test_anonymous_prayer_hides_identity_and_preserves_owner_deletion(self):
        status, rows = api("/rest/v1/prayer_requests?select=id,display_name,body",
                          self.student, "POST", {"user_id": self.student_id,
                          "display_name": "Must not be exposed", "body": self.marker,
                          "is_anonymous": True})
        self.assertEqual(status, 201)
        prayer_id = rows[0]["id"]
        path = "/rest/v1/prayer_requests?id=eq." + prayer_id
        status, public = api(path + "&select=id,display_name,body,prayed_count")
        self.assertEqual(status, 200)
        self.assertEqual(public[0]["display_name"], "Anónimo")
        self.assertNotIn("user_id", public[0])
        for token in (None, self.student, self.admin):
            denied = 403 if token else 401
            self.assertEqual(api(path + "&select=user_id", token)[0], denied)
            self.assertEqual(api(path + "&select=*", token)[0], denied)
        status, owned = api("/rest/v1/rpc/own_prayer_request_ids", self.student, "POST", {})
        self.assertEqual(status, 200)
        self.assertIn({"id": prayer_id}, owned)
        status, other = api("/rest/v1/rpc/own_prayer_request_ids", self.admin, "POST", {})
        self.assertEqual(status, 200)
        self.assertNotIn({"id": prayer_id}, other)
        self.assertEqual(api("/rest/v1/rpc/own_prayer_request_ids", method="POST", data={})[0], 401)
        self.assertEqual(api(path + "&select=id", self.student, "DELETE")[0], 200)
        self.assertEqual(api(path + "&select=id")[1], [])