CREATE TABLE IF NOT EXISTS users (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'job_seeker'
                  CHECK (role IN ('job_seeker', 'employer', 'admin')),
  registered_as VARCHAR(20)  NOT NULL
                  CHECK (registered_as IN ('job_seeker', 'employer')),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
  id          SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(150) NOT NULL,
  description TEXT,
  website     VARCHAR(255),
  logo_url    VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id          SERIAL PRIMARY KEY,
  company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location    VARCHAR(150),
  salary_min  INTEGER,
  salary_max  INTEGER,
  job_type    VARCHAR(20) NOT NULL CHECK (job_type IN ('full_time', 'part_time', 'contract', 'remote')),
  status      VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id           SERIAL PRIMARY KEY,
  job_id       INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_url   VARCHAR(255),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  applied_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (job_id, applicant_id)
);

-- Indexes for frequently filtered/sorted columns
CREATE INDEX IF NOT EXISTS idx_jobs_status      ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type    ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id  ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at  ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_salary_min  ON jobs(salary_min);

-- Full-text search index (avoids building tsvector on every query)
CREATE INDEX IF NOT EXISTS idx_jobs_fts ON jobs
  USING GIN(to_tsvector('english', title || ' ' || description));

CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id       ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS job_alerts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keywords   VARCHAR(100),
  job_type   VARCHAR(20) CHECK (job_type IN ('full_time', 'part_time', 'contract', 'remote')),
  location   VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user_id ON job_alerts(user_id);

CREATE TABLE IF NOT EXISTS company_followers (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id  INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_company_followers_user_id    ON company_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_company_followers_company_id ON company_followers(company_id);

CREATE TABLE IF NOT EXISTS job_tracker (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Job info (manual entry, any platform)
  job_title          VARCHAR(150) NOT NULL,
  company_name       VARCHAR(150) NOT NULL,
  job_url            VARCHAR(500),
  platform           VARCHAR(100),
  location           VARCHAR(150),
  job_type           VARCHAR(50),
  salary_min         INTEGER,
  salary_max         INTEGER,
  currency           VARCHAR(10) DEFAULT 'BDT',

  -- Dates
  applied_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  deadline           DATE,

  -- Status
  application_status VARCHAR(50) NOT NULL DEFAULT 'applied'
    CHECK (application_status IN ('applied','assessment','interview','offer','rejected','ghosted','withdrawn')),

  -- Task / Assessment
  task_link          VARCHAR(500),
  task_deadline      DATE,

  -- Interview
  interview_date     TIMESTAMP,
  interview_type     VARCHAR(50),

  -- Notes
  notes              TEXT,

  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_tracker_user_id ON job_tracker(user_id);
CREATE INDEX IF NOT EXISTS idx_job_tracker_status  ON job_tracker(application_status);
