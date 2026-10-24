-- ============================================================
-- TrustChain Decentralized Credential Verification Schema
-- ============================================================

-- 1. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.institutions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    did TEXT NOT NULL UNIQUE,
    registration_date TEXT NOT NULL,
    issuer_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'suspended')),
    tx_ref TEXT NOT NULL,
    metadata TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ISSUERS TABLE
CREATE TABLE IF NOT EXISTS public.issuers (
    id TEXT PRIMARY KEY,
    institution_id TEXT NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    key_fingerprint TEXT NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
    authorized_date TEXT NOT NULL,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS public.credentials (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    issuing_institution TEXT NOT NULL,
    issuer_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    issue_date TEXT NOT NULL,
    expiration_date TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    fingerprint TEXT NOT NULL,
    tx_ref TEXT NOT NULL,
    proof_method TEXT NOT NULL DEFAULT 'Ed25519Signature2020',
    trust_registry_ref TEXT NOT NULL,
    revocation_ref TEXT,
    revocation_date TEXT,
    revocation_reason TEXT,
    did TEXT NOT NULL,
    document_image TEXT,
    document_image_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. AUDIT EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN (
        'institution_registration',
        'issuer_authorization',
        'credential_issuance',
        'credential_verification',
        'credential_revocation',
        'failed_auth'
    )),
    actor TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    related TEXT NOT NULL,
    tx_ref TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('success', 'rejected', 'alert')),
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_issuers_institution_id ON public.issuers(institution_id);
CREATE INDEX IF NOT EXISTS idx_credentials_subject_id ON public.credentials(subject_id);
CREATE INDEX IF NOT EXISTS idx_credentials_fingerprint ON public.credentials(fingerprint);
CREATE INDEX IF NOT EXISTS idx_credentials_did ON public.credentials(did);
CREATE INDEX IF NOT EXISTS idx_credentials_issuer_id ON public.credentials(issuer_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON public.audit_events(timestamp DESC);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access for TrustChain demo clients
CREATE POLICY "Allow public read institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Allow public insert institutions" ON public.institutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update institutions" ON public.institutions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read issuers" ON public.issuers FOR SELECT USING (true);
CREATE POLICY "Allow public insert issuers" ON public.issuers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update issuers" ON public.issuers FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read credentials" ON public.credentials FOR SELECT USING (true);
CREATE POLICY "Allow public insert credentials" ON public.credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update credentials" ON public.credentials FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read audit_events" ON public.audit_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert audit_events" ON public.audit_events FOR INSERT WITH CHECK (true);

-- Grant privileges to anon and authenticated API roles
GRANT ALL ON TABLE public.institutions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.issuers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.credentials TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.audit_events TO anon, authenticated, service_role;

-- 7. INITIAL SEED DATA
INSERT INTO public.institutions (id, name, type, did, registration_date, issuer_count, status, tx_ref, metadata)
VALUES
  ('inst-001', 'Western Institute of Technology', 'University', 'did:trustchain:wit:8f3a2b91c4d7e6f0a1b2c3d4e5f6a7b8', '2024-03-15', 12, 'verified', '0xf4a2b8c1d9e7f3a6b0c5d2e8f1a4b7c0', 'Accredited research and technology university, est. 1982'),
  ('inst-002', 'National Skills Certification Board', 'Government Body', 'did:trustchain:nscb:2c4e6a8f0b1d3e5c7a9f2b4d6e8a0c2e', '2024-01-08', 47, 'verified', '0xa1b3c5d7e9f2a4b6c8d0e2f4a6b8c0d2', 'Federal authority for professional skills certification'),
  ('inst-003', 'Meridian University', 'University', 'did:trustchain:mu:9b3d5f7a1c2e4f6a8b0d2e4f6a8c0e2f', '2024-05-22', 8, 'verified', '0xc2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2', 'Prestigious liberal arts and sciences university'),
  ('inst-004', 'Digital Learning Authority', 'Education Authority', 'did:trustchain:dla:1a3c5e7b9d2f4a6c8e0b3d5f7a9c1e3f', '2024-07-11', 23, 'verified', '0xe0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0', 'National authority for digital education credentials')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.issuers (id, institution_id, institution_name, key_fingerprint, permissions, status, authorized_date, history)
VALUES
  ('issuer-001', 'inst-001', 'Western Institute of Technology', 'SHA256:k8Xm2nP9qR4sT1uV5wY7zA3bC6dE0fG', ARRAY['academic_degree', 'course_completion', 'internship_certificate'], 'active', '2024-03-16', '[{"date": "2024-03-16", "action": "Authorized"}]'::jsonb),
  ('issuer-002', 'inst-002', 'National Skills Certification Board', 'SHA256:j7Wl1mO8pQ3rS0tU4vX6yZ2aC5bD9eF', ARRAY['professional_qualification', 'course_completion'], 'active', '2024-01-09', '[{"date": "2024-01-09", "action": "Authorized"}]'::jsonb),
  ('issuer-003', 'inst-003', 'Meridian University', 'SHA256:h6Vk0lN7oP2qR9sT3uW5xY1zB4cE8dG', ARRAY['academic_degree', 'internship_certificate'], 'active', '2024-05-23', '[{"date": "2024-05-23", "action": "Authorized"}]'::jsonb),
  ('issuer-004', 'inst-001', 'Western Institute of Technology', 'SHA256:g5Uj9kM6nO1pQ8rS2tV4wX0yA3bC7dE', ARRAY['academic_degree'], 'deactivated', '2024-02-01', '[{"date": "2024-02-01", "action": "Authorized"}, {"date": "2024-09-14", "action": "Deactivated — Key rotation"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.credentials (id, type, issuing_institution, issuer_id, subject_id, subject_name, issue_date, expiration_date, status, fingerprint, tx_ref, proof_method, trust_registry_ref, revocation_ref, revocation_date, revocation_reason, did, document_image)
VALUES
  ('cred-2024-WIT-09182', 'Academic Degree', 'Western Institute of Technology', 'issuer-001', 'sub:A3F8B2C1D9E7F6A4', 'Jordan A. Chen', '2024-06-15', NULL, 'active', 'sha256:a4f8b2c1d9e7f6a4b8c2d1e9f7a6b4c2', '0xb4c2d1e9f7a6b4c2d1e9f7a6b4c2d1e9', 'Ed25519Signature2020', 'tc:registry:0xf4a2b8c1d9e7f3a6', NULL, NULL, NULL, 'did:trustchain:wit:8f3a2b91c4d7e6f0a1b2c3d4e5f6a7b8', '/sample_degree.jpg'),
  ('cred-2024-NSCB-04521', 'Professional Qualification', 'National Skills Certification Board', 'issuer-002', 'sub:B7E3C4D2F8A1E5B9', 'Priya R. Nair', '2024-09-01', '2027-09-01', 'active', 'sha256:c7e3c4d2f8a1e5b9c7e3c4d2f8a1e5b9', '0xd8e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', 'Ed25519Signature2020', 'tc:registry:0xa1b3c5d7e9f2a4b6', NULL, NULL, NULL, 'did:trustchain:nscb:2c4e6a8f0b1d3e5c7a9f2b4d6e8a0c2e', '/sample_degree.jpg'),
  ('cred-2024-MU-11203', 'Internship Certificate', 'Meridian University', 'issuer-003', 'sub:C2A9D5E1F7B3C8D4', 'Sam O. Williams', '2024-08-20', '2025-08-20', 'revoked', 'sha256:e1f7b3c8d4a9d5e1f7b3c8d4a9d5e1f7', '0xf1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6', 'Ed25519Signature2020', 'tc:registry:0xc2d4e6f8a0b2c4d6', 'revoc:0xa8b9c0d1e2f3a4b5', '2024-10-05', 'Subject employment status change', 'did:trustchain:mu:9b3d5f7a1c2e4f6a8b0d2e4f6a8c0e2f', '/sample_degree.jpg'),
  ('cred-2024-DLA-07744', 'Course Completion', 'Digital Learning Authority', 'issuer-002', 'sub:D5F2A8B1C9E3D6F4', 'Alex M. Torres', '2024-10-01', '2026-10-01', 'active', 'sha256:f2a8b1c9e3d6f4d5f2a8b1c9e3d6f4d5', '0xa2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', 'Ed25519Signature2020', 'tc:registry:0xe0f2a4b6c8d0e2f4', NULL, NULL, NULL, 'did:trustchain:dla:1a3c5e7b9d2f4a6c8e0b3d5f7a9c1e3f', '/sample_degree.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.audit_events (id, type, actor, timestamp, related, tx_ref, outcome, details)
VALUES
  ('evt-001', 'credential_verification', 'External Verifier: Apex Corp HR', '2024-10-24T12:34:56Z', 'cred-2024-WIT-09182', '0xb4c2d1e9f7a6b4c2', 'success', 'All 6 verification checks passed. Signature valid. Issuer authorized.'),
  ('evt-002', 'credential_revocation', 'issuer-003 (Meridian University)', '2024-10-05T09:15:22Z', 'cred-2024-MU-11203', '0xa8b9c0d1e2f3a4b5', 'success', 'Credential revoked. Reason: Subject employment status change.'),
  ('evt-003', 'failed_auth', 'Unknown entity: did:unknown:rogue:ff2a8b', '2024-10-23T18:02:11Z', 'N/A', 'N/A', 'alert', 'Attempted credential issuance rejected. Issuer not found in trust registry.'),
  ('evt-004', 'credential_issuance', 'issuer-001 (Western Institute of Technology)', '2024-06-15T10:00:00Z', 'cred-2024-WIT-09182', '0xb4c2d1e9f7a6b4c2d1e9f7a6b4c2d1e9', 'success', 'Academic Degree credential issued to sub:A3F8B2C1D9E7F6A4.'),
  ('evt-005', 'institution_registration', 'Admin: Digital Learning Authority', '2024-07-11T08:45:00Z', 'inst-004', '0xe0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0', 'success', 'Institution registered and DID anchored to trust registry.')
ON CONFLICT (id) DO NOTHING;
