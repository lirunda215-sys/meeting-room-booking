-- 创建数据库
CREATE DATABASE IF NOT EXISTS lrd;
\c lrd;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('EMPLOYEE', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议室表
CREATE TABLE IF NOT EXISTS rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    capacity INTEGER NOT NULL,
    equipment TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议室配置表（管理员设置）
CREATE TABLE IF NOT EXISTS room_settings (
    id BIGSERIAL PRIMARY KEY,
    max_duration_minutes INTEGER DEFAULT 240,
    min_duration_minutes INTEGER DEFAULT 30,
    max_booking_days_ahead INTEGER DEFAULT 7,
    min_booking_advance_minutes INTEGER DEFAULT 30,
    send_email_notification BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议预约表
CREATE TABLE IF NOT EXISTS meetings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    organizer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议参会人表
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'INVITED' CHECK (status IN ('INVITED', 'ACCEPTED', 'DECLINED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);

-- 茶水服务表（免费）
CREATE TABLE IF NOT EXISTS catering_services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议茶水表
CREATE TABLE IF NOT EXISTS meeting_caterings (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    catering_id BIGINT NOT NULL REFERENCES catering_services(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会议文件表
CREATE TABLE IF NOT EXISTS meeting_files (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号（密码：admin123）
INSERT INTO users (username, password, email, name, role) VALUES 
('admin', 'admin123', 'admin@company.com', '管理员', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 插入默认员工账号（密码：123456）
INSERT INTO users (username, password, email, name, role) VALUES 
('employee', '123456', 'employee@company.com', '员工张三', 'EMPLOYEE'),
('lihua', '123456', 'lihua@company.com', '李华', 'EMPLOYEE'),
('wangming', '123456', 'wangming@company.com', '王明', 'EMPLOYEE')
ON CONFLICT (username) DO NOTHING;

-- 插入示例会议室
INSERT INTO rooms (name, location, capacity, equipment, is_active) VALUES 
('大会议室A', '1楼东侧', 50, '投影仪，白板、视频会议系统', TRUE),
('中会议室B', '2楼西侧', 20, '投影仪，白板', TRUE),
('小会议室C', '3楼东侧', 8, '白板', TRUE),
('VIP会议室', '10楼', 15, '投影仪，白板、视频会议系统', TRUE)
ON CONFLICT DO NOTHING;

-- 插入示例茶水服务（免费）
INSERT INTO catering_services (name, description, is_active, image_url) VALUES 
('矿泉水', '瓶装矿泉水', TRUE, ''),
('茶水', '红茶、绿茶、普洱等', TRUE, ''),
('咖啡', '现磨咖啡', TRUE, ''),
('点心', '饼干、小蛋糕等', TRUE, '')
ON CONFLICT DO NOTHING;

-- 插入默认配置
INSERT INTO room_settings (max_duration_minutes, min_duration_minutes, max_booking_days_ahead, min_booking_advance_minutes, send_email_notification) VALUES 
(240, 30, 7, 30, FALSE)
ON CONFLICT DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_meetings_room_id ON meetings(room_id);
CREATE INDEX IF NOT EXISTS idx_meetings_organizer_id ON meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_caterings_meeting_id ON meeting_caterings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_files_meeting_id ON meeting_files(meeting_id);
