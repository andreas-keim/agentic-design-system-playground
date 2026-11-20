# ApprovalGate

Mount the gate with a proposal returned by `stageChanges` or `stageRollback`. Describe the business consequence in `impactSummary`. The dialog adds the surface, base version, distinct record count and field-level differences. The disclosure lists the inverse edits and the approved SHA-256 digest.

The reject button receives initial focus. Escape, rejection and undo discard the approval in one action. A replacement digest or unmount cancels the countdown. The default undo window is five seconds. Set `allowUndo={false}` for immediate dispatch on approval.

Pass the received proposal and approved digest to `commitChanges` in `onCommit`. The caller owns write receipts, failure reporting and post-commit state. Keep the opening control mounted for focus restoration. The Workbench inspector implements this flow.
