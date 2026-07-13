from app.domain.documents.entities import Document


SEED_DOCUMENTS = [
    Document(
        title="Leave Policy 2026",
        source_filename="leave_policy_2026.txt",
        space="HR Policies",
        content="""Leave Policy
Employees receive 12 casual leave days per calendar year. Casual leave should be requested at least two working days before the planned absence unless the absence is urgent.

Sick Leave
Employees receive 10 sick leave days per calendar year. Medical evidence may be requested when sick leave exceeds three consecutive working days.

Approval
Managers approve casual leave for their direct reports. HR reviews exceptions and carries out annual reconciliation.""",
    ),
    Document(
        title="Expense Reimbursement SOP",
        source_filename="expense_reimbursement_sop.txt",
        space="Finance",
        content="""Travel Reimbursement
Employees may claim rail travel and economy air travel for approved business trips. Hotel reimbursement is capped at the corporate rate schedule.

Domestic Travel
Domestic travel claims must include receipts, trip purpose, project code, and manager approval. Claims should be submitted within 30 days of travel.

Exclusions
Personal upgrades, minibar charges, and undocumented expenses are not reimbursable.""",
    ),
    Document(
        title="Vendor Contract Template",
        source_filename="vendor_contract_template.txt",
        space="Legal",
        content="""Contract Authority
Only authorised procurement managers and legal approvers may approve vendor contracts. Interns cannot approve vendor contracts.

Notice Period
Permanent vendor service agreements require a 60 day termination notice unless a signed order form states a different period.

Renewal
Automatic renewal clauses must be reviewed by Legal before signature.""",
    ),
    Document(
        title="Engineering Incident Runbook",
        source_filename="incident_runbook.txt",
        space="Engineering",
        content="""SOC 2 Controls
Production incidents must preserve audit evidence for SOC 2 controls CC7.2 and CC7.3. Incident commanders record timeline, impact, mitigation, and postmortem owner.

Escalation
Critical incidents require notification to the engineering manager within 15 minutes and customer support within 30 minutes.

Recovery
Rollbacks should be preferred when the failed release can be safely reverted.""",
    ),
]

