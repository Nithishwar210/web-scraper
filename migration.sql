-- Create a schema for your scraper data
CREATE SCHEMA if not exists scraper;

CREATE TYPE tag_type AS ENUM (
    'Programming Language',
    'Framework',
    'Library',
    'Tool',
    'Database',
    'Operating System',
    'Other'
);

	-- drop table scraper.tags
	-- 	drop table scraper.questions
-- Create tables within the scraper schema
CREATE TABLE if not exists scraper.tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
	type tag_type not null default 'Other',
	questions int not null default 0
);

CREATE TABLE if not exists scraper.questions (
    id SERIAL PRIMARY KEY,
    tag_id INTEGER REFERENCES scraper.tags(id),
    title TEXT not null,
    votes INTEGER default 0,
    views INTEGER default 0,
    answers INTEGER default 0,
    detail JSONB,  -- Store detail as JSONB for flexibility,
	CONSTRAINT  tag_title unique(tag_id,title)
);

alter table scraper.tags
add column created_at timestamp  default now(),
add column updated_at timestamp;


alter table scraper.questions
add column created_at timestamp default now(),
add column updated_at timestamp;