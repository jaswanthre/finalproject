CREATE TABLE campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_email VARCHAR(150) REFERENCES users(email) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL,
    raised_amount NUMERIC(12,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    city VARCHAR(100),
    campaign_image TEXT, -- Cover image
    status VARCHAR(20) DEFAULT 'PENDING', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaign_categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE campaign_category_map (
    id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    category_id INT REFERENCES campaign_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE campaign_media (
    media_id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) CHECK (media_type IN ('IMAGE','VIDEO','DOC')),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaign_comments (
    comment_id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    user_email VARCHAR(150) REFERENCES users(email),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE campaigns SET raised_amount = 0 WHERE raised_amount IS NULL;

ALTER TABLE campaigns 
    ALTER COLUMN raised_amount SET DEFAULT 0,
    ALTER COLUMN raised_amount SET NOT NULL;

