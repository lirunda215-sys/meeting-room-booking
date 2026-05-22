-- PostgreSQL: 为 meeting_caterings 表添加 quantity 列
-- 如果列已存在则跳过（PostgreSQL 使用 DO 块实现）

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meeting_caterings' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE meeting_caterings ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1;
    END IF;
END $$;