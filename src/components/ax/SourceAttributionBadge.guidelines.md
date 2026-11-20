# SourceAttributionBadge

Place one badge next to the field it describes. Supply the recorded SHA-256 digest and ISO timestamp of the displayed revision. Agent attribution also requires the model and version used for that revision.

Bind `onRollback` to the specific field and enforce the expected digest and version in the write path. Resolve with the saved manual provenance after restoring the field. For a single-field governance stage, verify the approved digest, use `stageRollback` and apply the inverse with `commitChanges`. A multi-field stage needs a field-scoped inverse before it can back a field-level action.

The popover shows the full digest and timestamp. Opening it performs no write. While a rollback is pending, repeated activation cannot submit another write. A rejected write keeps the agent attribution and reports the error. Supply fresh source metadata when another write changes the field.
