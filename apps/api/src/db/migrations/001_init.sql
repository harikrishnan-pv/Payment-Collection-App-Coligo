-- 001_init: customers + payments schema for the Coligo payment collection app
-- Indexes per architecture AD-8: hot paths must be index-backed.

CREATE TABLE IF NOT EXISTS customers (
  id              BIGSERIAL PRIMARY KEY,
  account_number  VARCHAR(20)  NOT NULL,
  name            VARCHAR(120) NOT NULL,
  issue_date      DATE         NOT NULL,
  interest_rate   NUMERIC(5,2) NOT NULL CHECK (interest_rate > 0),
  tenure_months   INTEGER      NOT NULL CHECK (tenure_months > 0),
  emi_due         NUMERIC(12,2) NOT NULL CHECK (emi_due > 0),
  outstanding     NUMERIC(12,2) NOT NULL CHECK (outstanding >= 0)
);

-- Natural lookup key used by GET /payments/:account_number and POST /payments
CREATE UNIQUE INDEX IF NOT EXISTS customers_account_number_key ON customers (account_number);

CREATE TABLE IF NOT EXISTS payments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- public payment reference
  customer_id    BIGINT        NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  payment_date   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  payment_amount NUMERIC(12,2) NOT NULL CHECK (payment_amount > 0),
  status         VARCHAR(10)   NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED'))
);

-- History hot path: newest-first payments per customer (AD-8)
CREATE INDEX IF NOT EXISTS payments_customer_date_idx ON payments (customer_id, payment_date DESC);
