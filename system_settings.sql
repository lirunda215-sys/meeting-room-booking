-- PostgreSQL: 创建系统设置表（如果不存在）
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认设置（如果不存在）
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('minBookingTime', '08:00', '会议室最早可预订时间')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES ('maxBookingTime', '22:00', '会议室最晚可预订时间')
ON CONFLICT (setting_key) DO NOTHING;