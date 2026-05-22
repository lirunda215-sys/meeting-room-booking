# 智能会议室预约管理系统 / Система бронирования конференц-залов

基于 React + Spring Boot + PostgreSQL 的企业级会议室预约管理平台，支持中俄双语。
/ Корпоративная платформа бронирования залов с поддержкой китайского и русского языков.

---

## 技术栈 / Технологии

| 层级 / Уровень | 技术 / Технология |
|------|------|
| 前端 / Фронтенд | React 19、React Router 6、Axios |
| 后端 / Бэкенд | Spring Boot 3.3、Spring Data JPA、Spring Mail |
| 数据库 / БД | PostgreSQL |
| 认证 / Аутентификация | JWT (JSON Web Token) |
| 构建 / Сборка | Maven (后端)、npm (前端) |

---

## 功能特性 / Функции

- **日历视图预订 / Календарь бронирования** — 按日期查看各会议室空闲/占用时段，点击空闲时段即可预定 / Просмотр доступности залов по датам
- **冲突自动检测 / Проверка конфликтов** — 后端五重校验（时长、过去时间、提前量、时间范围、时段冲突）/ 5 проверок бэкенда
- **参会人邀请 / Приглашение участников** — 下拉多选组件邀请参会人员 / Множественный выбор участников
- **茶水服务 / Кейтеринг** — 预定会议时可选择茶水种类与数量 / Выбор услуг питания при бронировании
- **文件上传 / Загрузка файлов** — 会议附件上传、查看、下载 / Загрузка и просмотр файлов
- **角色权限 / Роли** — USER（普通用户）/ ADMIN（管理员），JWT 认证 / Аутентификация JWT
- **中俄双语 / Двуязычность** — 全站静态文本 + 服务端动态错误信息双语切换 / Китайский и русский интерфейс
- **管理后台 / Админ-панель** — 会议室管理、用户管理、茶水服务管理、预订规则设置 / Управление залами, пользователями, кейтерингом
- **邮件通知 / Уведомления** — 会议创建/取消自动发送邮件通知 / Email-уведомления

---

## 项目结构 / Структура проекта

```
├── lrdfrontend/          # React 前端 / Фронтенд (:3000)
│   └── src/
│       ├── components/   # Calendar、MeetingForm、Navbar
│       ├── pages/        # Dashboard、MyMeetings、Login、AdminDashboard
│       ├── services/     # api.js (Axios 封装 / HTTP-клиент)
│       └── translations.js  # 中俄双语翻译 / Переводы
├── lrdbackend/           # Spring Boot 后端 / Бэкенд (:8080)
│   └── src/main/java/com/example/lrdbackend/
│       ├── config/       # JWT Filter、CORS 配置
│       ├── controller/   # 10 个 REST Controller
│       ├── service/      # 8 个业务 Service / 8 сервисов
│       ├── entity/       # 9 个 JPA 实体 / 9 сущностей
│       ├── repository/   # Spring Data JPA Repository
│       └── dto/          # 请求/响应 DTO
└── .gitignore
```

---

## 快速开始 / Быстрый старт

### 前置要求 / Требования

- **Java** 17+
- **Node.js** 18+
- **PostgreSQL** 15+
- **Maven** 3.8+

### 1. 数据库初始化 / Инициализация БД

在 PostgreSQL 中创建数据库 / Создайте базу данных:

```sql
CREATE DATABASE lrd;
```

然后执行项目根目录下的 `lrd.sql` 脚本 / Затем выполните скрипт `lrd.sql`.

### 2. 后端配置 / Настройка бэкенда

复制配置模板并填入数据库密码 / Скопируйте шаблон и укажите свои данные:

```bash
cd lrdbackend/src/main/resources
cp application.properties.example application.properties
```

编辑 `application.properties` / Отредактируйте:

```properties
spring.datasource.password=你的数据库密码 / Пароль БД
jwt.secret=你的JWT密钥 / Секретный ключ JWT
spring.mail.username=你的邮箱 / Ваш email
spring.mail.password=你的邮箱授权码 / Пароль приложения
```

### 3. 启动后端 / Запуск бэкенда

```bash
cd lrdbackend
mvnw spring-boot:run
```

后端运行在 / Бэкенд: http://localhost:8080

### 4. 启动前端 / Запуск фронтенда

```bash
cd lrdfrontend
npm install
npm start
```

前端运行在 / Фронтенд: http://localhost:3000

---

## API 概览 / Обзор API

| 方法 | 路径 | 说明 / Описание | 权限 / Доступ |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 / Регистрация | 公开 / Открытый |
| POST | `/api/auth/login` | 用户登录 / Вход | 公开 / Открытый |
| GET | `/api/rooms` | 会议室列表 / Список залов | 登录 / Авторизован |
| POST | `/api/meetings` | 创建会议 / Создание встречи | 登录 / Авторизован |
| GET | `/api/meetings/my` | 我的会议 / Мои встречи | 登录 / Авторизован |
| PUT | `/api/meetings/{id}/cancel` | 取消会议 / Отмена | 组织者/管理员 |
| POST | `/api/meeting-files/upload` | 上传文件 / Загрузка файла | 登录 / Авторизован |
| POST | `/api/meeting-caterings` | 添加茶水 / Кейтеринг | 登录 / Авторизован |
| GET | `/api/admin/users` | 管理用户 / Пользователи | 管理员 / Админ |
| GET | `/api/admin/rooms` | 管理会议室 / Залы | 管理员 / Админ |
| POST | `/api/system-settings` | 系统设置 / Настройки | 管理员 / Админ |

---

## 数据库表 / Таблицы БД

| 表名 / Таблица | 说明 / Описание |
|------|------|
| `users` | 用户信息 / Пользователи |
| `rooms` | 会议室信息 / Конференц-залы |
| `meetings` | 会议记录 / Встречи |
| `meeting_attendees` | 会议参会人 / Участники |
| `meeting_files` | 会议文件 / Файлы встреч |
| `meeting_caterings` | 会议茶水服务 / Кейтеринг |
| `catering_services` | 茶水服务种类 / Услуги кейтеринга |
| `room_settings` | 会议室预订规则 / Правила бронирования |
| `system_settings` | 系统全局设置 / Системные настройки |

---

## 默认角色 / Роли по умолчанию

| 角色 / Роль | 说明 / Описание |
|------|------|
| `USER` | 普通用户 — 浏览、预定、取消自己的会议 / Просмотр, бронирование, отмена |
| `ADMIN` | 管理员 — 全部权限 + 管理会议室/用户/茶水/设置 / Все права + управление |

---

## 许可证 / Лицензия

MIT