INSERT INTO organisations (id, name, slug, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'CiteIQ Workspace', 'citeiq', 'active')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO roles (code, description)
VALUES
    ('platform_admin', 'Manage platform settings and tenants'),
    ('organisation_admin', 'Manage one organisation'),
    ('department_manager', 'Manage department document spaces'),
    ('knowledge_editor', 'Upload and reprocess content'),
    ('standard_user', 'Ask questions and view allowed documents'),
    ('auditor', 'Read-only evidence and audit access')
ON CONFLICT (code) DO NOTHING;

INSERT INTO users (id, organisation_id, email, password_hash, status)
VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'admin@citeiq.test',
    'demo-password-hash',
    'active'
)
ON CONFLICT (organisation_id, email) DO NOTHING;

INSERT INTO document_spaces (id, organisation_id, name, visibility)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'HR Policies',
    'org'
)
ON CONFLICT DO NOTHING;
