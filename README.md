# 智能会议室预约管理系统 / Intelligent Meeting Room Booking System

基于 React + Spring Boot + PostgreSQL 的企业级会议室预约管理平台，支持中俄双语。

---

## 技术栈 / Tech Stack

| 层级 | 技术 |
|------|------|
| 前端 | React 19、React Router 6、Axios |
| 后端 | Spring Boot 3.3、Spring Data JPA、Spring Mail |
| 数据库 | PostgreSQL |
| 认证 | JWT (JSON Web Token) |
| 构建 | Maven (后端)、npm (前端) |

---

## 功能特性 / Features

- **日历视图预订** — 按日期查看各会议室空闲/占用时段，点击空闲时段即可预定
- **冲突自动检测** — 后端五重校验（时长、过去时间、提前量、时间范围、时段冲突）
- **参会人邀请** — 下拉多选组件邀请参会人员
- **茶水服务** — 预定会议时可选择茶水种类与数量
- **文件上传** — 会议附件上传、查看、下载
- **角色权限** — USER（普通用户）/ ADMIN（管理员），JWT 认证
- **中俄双语** — 全站静态文本 + 服务端动态错误信息双语切换
- **管理后台** — 会议室管理、用户管理、茶水服务管理、预订规则设置
- **邮件通知** — 会议创建/取消自动发送邮件通知

---

## 项目结构 / Project Structure

```
├── lrdfrontend/          # React 前端 (Port 3000)
│   └── src/
│       ├── components/   # Calendar、MeetingForm、Navbar
│       ├── pages/        # Dashboard、MyMeetings、Login、AdminDashboard
│       ├── services/     # api.js (Axios 封装)
│       └── translations.js  # 中俄双语翻译
├── lrdbackend/           # Spring Boot 后端 (Port 8080)
│   └── src/main/java/com/example/lrdbackend/
│       ├── config/       # JWT Filter、CORS 配置
│       ├── controller/   # 10 个 REST Controller
│       ├── service/      # 8 个业务 Service
│       ├── entity/       # 9 个 JPA 实体
│       ├── repository/   # Spring Data JPA Repository
│       └── dto/          # 请求/响应 DTO
└── .gitignore
```

---

## 快速开始 / Quick Start

### 前置要求 / Prerequisites

- **Java** 17+
- **Node.js** 18+
- **PostgreSQL** 15+
- **Maven** 3.8+

### 1. 数据库初始化

在 PostgreSQL 中创建数据库并导入表结构：

```sql
CREATE DATABASE lrd;
```

然后执行项目根目录下的 `lrd.sql` 脚本。

### 2. 后端配置

复制配置模板并填入你的数据库密码等信息：

```bash
cd lrdbackend/src/main/resources
cp application.properties.example application.properties
```

编辑 `application.properties`，修改以下配置：

```properties
spring.datasource.password=你的数据库密码
jwt.secret=你的JWT密钥
spring.mail.username=你的邮箱
spring.mail.password=你的邮箱授权码
```

### 3. 启动后端

```bash
cd lrdbackend
mvnw spring-boot:run
```

后端运行在 http://localhost:8080

### 4. 启动前端

```bash
cd lrdfrontend
npm install
npm start
```

前端运行在 http://localhost:3000

---

## API 概览 / API Overview

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/login` | 用户登录 | 公开 |
| GET | `/api/rooms` | 获取会议室列表 | 登录 |
| POST | `/api/meetings` | 创建会议 | 登录 |
| GET | `/api/meetings/my` | 我的会议 | 登录 |
| PUT | `/api/meetings/{id}/cancel` | 取消会议 | 组织者/管理员 |
| POST | `/api/meeting-files/upload` | 上传会议文件 | 登录 |
| POST | `/api/meeting-caterings` | 添加茶水服务 | 登录 |
| GET | `/api/admin/users` | 管理用户 | 管理员 |
| GET | `/api/admin/rooms` | 管理会议室 | 管理员 |
| POST | `/api/system-settings` | 系统设置 | 管理员 |

---

## 数据库表 / Database Tables

| 表名 | 说明 |
|------|------|
| `users` | 用户信息 |
| `rooms` | 会议室信息 |
| `meetings` | 会议记录 |
| `meeting_attendees` | 会议参会人 |
| `meeting_files` | 会议文件 |
| `meeting_caterings` | 会议茶水服务 |
| `catering_services` | 茶水服务种类 |
| `room_settings` | 会议室预订规则 |
| `system_settings` | 系统全局设置 |

---

## 默认角色 / Default Roles

| 角色 | 说明 |
|------|------|
| `USER` | 普通用户 — 浏览会议室、预定、查看/取消自己的会议 |
| `ADMIN` | 管理员 — 以上全部 + 管理会议室、用户、茶水、系统设置 |

---

## 许可证 / License

MIT