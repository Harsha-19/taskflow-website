from marshmallow import Schema, fields, validate

class TaskSchema(Schema):
    title = fields.String(required=True, validate=validate.Length(min=1, max=200))
    project_id = fields.Integer(required=True)
    priority = fields.String(validate=validate.OneOf(["low", "medium", "high"]), load_default="medium")
    notes = fields.String(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    completed = fields.Boolean()

class TaskUpdateSchema(Schema):
    title = fields.String(validate=validate.Length(min=1, max=200))
    priority = fields.String(validate=validate.OneOf(["low", "medium", "high"]))
    notes = fields.String(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    completed = fields.Boolean()
