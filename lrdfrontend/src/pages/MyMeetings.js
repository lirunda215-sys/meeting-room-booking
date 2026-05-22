import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../hooks/useToast';
import { useDialog } from '../hooks/useDialog';
import api from '../services/api';

function MyMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { language, t, td } = useLanguage();
  const { addToast } = useToast();
  const { showConfirm } = useDialog();

  const fetchMyMeetings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      console.log('🔵 开始获取我的会议列表...');
      const basicMeetings = await api.meetings.getMy();
      console.log('✅ 获取到基础会议数量:', basicMeetings ? basicMeetings.length : 0);
      
      const activeMeetings = basicMeetings.filter(m => m.status === 'SCHEDULED');
      console.log('🟢 过滤后的有效会议数量:', activeMeetings.length);
      
      // 为每个会议获取详细数据（包含参会者、文件、茶水）
      console.log('🔄 开始获取每个会议的详细数据...');
      const meetingsWithDetails = await Promise.all(
        activeMeetings.map(async (meeting) => {
          try {
            console.log(`   📋 获取会议 ${meeting.id} 的详细数据...`);
            const details = await api.meetings.getWithDetailsById(meeting.id);
            console.log(`   ✅ 会议 ${meeting.id} 详情获取成功:`, details);
            
            console.log(`      - 参会者数量:`, details.attendees?.length || 0);
            console.log(`      - 文件数量:`, details.files?.length || 0);
            console.log(`      - 茶水数量:`, details.caterings?.length || 0);
            
            return details;
          } catch (err) {
            console.error(`   ❌ 获取会议 ${meeting.id} 详情失败:`, err);
            return meeting;
          }
        })
      );
      
      console.log('✅ 所有会议详情获取完成:', meetingsWithDetails);
      setMeetings(meetingsWithDetails);
    } catch (err) {
      console.error('❌ 获取会议列表失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyMeetings();
  }, [fetchMyMeetings]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0 && diffMins > 0) {
      return `${diffHours}${language === 'zh' ? '小时' : 'ч.'} ${diffMins}${language === 'zh' ? '分钟' : 'мин.'}`;
    } else if (diffHours > 0) {
      return `${diffHours}${language === 'zh' ? '小时' : 'ч.'}`;
    } else {
      return `${diffMins}${language === 'zh' ? '分钟' : 'мин.'}`;
    }
  };

  const handleCancel = async (meetingId, meetingTitle) => {
    const confirmed = await showConfirm({
      title: t('confirmCancel'),
      message: t('confirmCancelBookingDetail').replace('{title}', meetingTitle),
      confirmText: t('confirm'),
      cancelText: t('cancel'),
      confirmColor: '#dc2626'
    });
    if (confirmed) {
      try {
        await api.meetings.cancel(meetingId);
        await fetchMyMeetings();
        addToast(t('bookingCancelledSuccess'), 'success');
      } catch (err) {
        addToast(t('cancelFailed'), 'error');
      }
    }
  };

  const handleDownload = (file) => {
    if (file.fileUrl) {
      window.open(file.fileUrl.startsWith('http') ? file.fileUrl : `http://localhost:8080${file.fileUrl}`, '_blank');
    } else if (file.fileName) {
      const fileName = file.filePath ? file.filePath.split(/[\\/]/).pop() : file.fileName;
      window.open(`http://localhost:8080/api/meeting-files/download/${fileName}`, '_blank');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'CANCELLED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'COMPLETED':
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
    }
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}>📅</div>
      <div style={styles.loadingText}>{t('loading')}</div>
      <div style={styles.loadingSubtext}>{t('loadingInfo')}</div>
    </div>
  );

  if (error) return (
    <div style={styles.errorContainer}>
      <div style={styles.errorIcon}>⚠️</div>
      <div style={styles.errorText}>{t('error')}</div>
      <div style={styles.errorSubtext}>{error}</div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t('myMeetings')}</h1>
          <p style={styles.subtitle}>
            {meetings.length > 0 
              ? (language === 'zh' ? `您共有 ${meetings.length} 个预定会议` : `У вас ${meetings.length} забронированных встреч`)
              : (language === 'zh' ? '暂无预定会议' : 'Нет запланированных встреч')
            }
          </p>
        </div>
        <button onClick={fetchMyMeetings} style={styles.refreshButton}>
          🔄 {t('refresh')}
        </button>
      </div>

      {meetings.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>📅</div>
          <div style={styles.emptyTitle}>{t('noMeetings')}</div>
          <div style={styles.emptySubtext}>{t('goBook')}</div>
        </div>
      ) : (
        <div style={styles.meetingList}>
          {meetings.map(meeting => {
            const attendees = meeting.attendees || [];
            const files = meeting.files || [];
            const caterings = meeting.caterings || [];
            
            console.log(`🟢 渲染会议 ${meeting.id}:`, {
              attendeesCount: attendees.length,
              filesCount: files.length,
              cateringsCount: caterings.length,
              attendees: attendees,
              files: files,
              caterings: caterings
            });
            
            return (
              <div key={meeting.id} style={styles.meetingCard}>
                
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.meetingTitle}>{meeting.title}</h3>
                    <div style={styles.roomName}>
                      📍 {meeting.room?.name ? td('roomName', meeting.room.name) : ''}
                    </div>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    ...getStatusColor(meeting.status)
                  }}>
                    {meeting.status === 'SCHEDULED' 
                      ? (language === 'zh' ? '已安排' : 'Запланировано')
                      : meeting.status
                  }
                  </span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.infoSection}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>📆</span>
                      <span style={styles.infoText}>{formatDate(meeting.startTime)}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoIcon}>⏰</span>
                      <span style={styles.infoText}>
                        {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                        <span style={styles.duration}>（{getDuration(meeting.startTime, meeting.endTime)}）</span>
                      </span>
                    </div>
                    {meeting.room?.location && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>🏢</span>
                        <span style={styles.infoText}>{td('roomLocation', meeting.room.location)}</span>
                      </div>
                    )}
                    {meeting.room?.capacity && (
                      <div style={styles.infoRow}>
                        <span style={styles.infoIcon}>👥</span>
                        <span style={styles.infoText}>
                          {language === 'zh' ? '容量' : 'Вместимость'}: {meeting.room.capacity} {t('people')}
                        </span>
                      </div>
                    )}
                  </div>

                  {meeting.room?.equipment && (
                    <div style={styles.equipmentSection}>
                      <div style={styles.sectionLabel}>
                        📺 {language === 'zh' ? '设备设施' : 'Оборудование'}
                      </div>
                      <div style={styles.equipmentTags}>
                        {meeting.room.equipment.split(/[,，]/).map((eq, idx) => (
                          <span key={idx} style={styles.equipmentTag}>{eq.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {meeting.description && (
                    <div style={styles.descriptionSection}>
                      <div style={styles.sectionLabel}>
                        📋 {t('meetingDescription')}
                      </div>
                      <div style={styles.description}>{meeting.description}</div>
                    </div>
                  )}

                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>
                      🍵 {t('catering')} ({caterings.length})
                    </div>
                    {caterings.length > 0 ? (
                      <div style={styles.serviceGrid}>
                        {caterings.map((c, idx) => (
                          <div key={`catering-${meeting.id}-${idx}-${c.id || idx}`} style={styles.serviceItem}>
                            <div style={styles.serviceIcon}>☕</div>
                            <div style={styles.serviceInfo}>
                              <div style={styles.serviceName}>
                                {c.catering?.name ? td('cateringName', c.catering.name) : (language === 'zh' ? '茶水服务' : 'Услуга')}
                              </div>
                              {c.catering?.description && (
                                <div style={styles.serviceDesc}>
                                  {c.catering.description ? td('cateringDescription', c.catering.description) : ''}
                                </div>
                              )}
                              {c.quantity != null && c.quantity > 0 && (
                                <div style={styles.serviceQuantity}>
                                  {language === 'zh' ? '数量: ' : '数量: '}{c.quantity}
                                </div>
                              )}
                              {c.catering?.price != null && c.catering.price > 0 && (
                                <div style={styles.servicePrice}>
                                  ¥{c.catering.price}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={styles.noData}>
                        {language === 'zh' ? '未选择茶水服务' : 'Без услуг'}
                      </div>
                    )}
                  </div>

                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>
                      👥 {t('participants')} ({attendees.length})
                    </div>
                    {attendees.length > 0 ? (
                      <div style={styles.participantGrid}>
                        {attendees.map((attendee, idx) => (
                        <div key={`attendee-${meeting.id}-${idx}-${attendee.id || idx}`} style={styles.participantItem}>
                          <div style={styles.participantAvatar}>
                            {attendee.user?.name ? attendee.user.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div style={styles.participantInfo}>
                            <div style={styles.participantName}>
                              {attendee.user?.name || (language === 'zh' ? '未知用户' : 'Неизвестный')}
                            </div>
                            {attendee.user?.email && (
                              <div style={styles.participantEmail}>{attendee.user.email}</div>
                            )}
                            <div style={styles.participantRole}>
                              {attendee.user?.role === 'ADMIN' 
                                ? (language === 'zh' ? '管理员' : 'Админ')
                                : (language === 'zh' ? '员工' : 'Сотрудник')
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                    ) : (
                      <div style={styles.noData}>
                        {language === 'zh' ? '暂无参会人员' : 'Без участников'}
                      </div>
                    )}
                  </div>

                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>
                      📁 {t('files')} ({files.length})
                    </div>
                    {files.length > 0 ? (
                      <div style={styles.fileList}>
                        {files.map((file, idx) => (
                        <div key={`file-${meeting.id}-${idx}-${file.id || idx}`} style={styles.fileItem}>
                            <div style={styles.fileIcon}>📄</div>
                            <div style={styles.fileInfo}>
                              <div style={styles.fileName}>{file.fileName || '文件'}</div>
                              <div style={styles.fileSize}>
                                {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : ''}
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDownload(file)}
                              style={styles.downloadButton}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#d97706'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#f59e0b'}
                            >
                              ⬇️ {t('download')}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={styles.noData}>
                        {language === 'zh' ? '暂无上传文件' : 'Без файлов'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.footerInfo}>
                    {language === 'zh' ? '组织者' : 'Организатор'}: {meeting.organizer?.name || '-'}
                  </div>
                  <button 
                    onClick={() => handleCancel(meeting.id, meeting.title)}
                    style={styles.cancelButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fecaca';
                      e.target.style.borderColor = '#f87171';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#fee2e2';
                      e.target.style.borderColor = '#fca5a5';
                    }}
                  >
                    🗑️ {t('cancelMeeting')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    color: 'white'
  },
  title: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '1rem',
    opacity: 0.95
  },
  refreshButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'white',
    transition: 'all 0.3s'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '6rem 2rem',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  emptySubtext: {
    fontSize: '1rem',
    color: '#9ca3af'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '3rem'
  },
  spinner: {
    fontSize: '3rem',
    marginBottom: '1rem',
    animation: 'pulse 2s infinite'
  },
  loadingText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.5rem'
  },
  loadingSubtext: {
    fontSize: '0.875rem',
    color: '#9ca3af'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    padding: '3rem'
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  errorText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '0.5rem'
  },
  errorSubtext: {
    fontSize: '0.875rem',
    color: '#9ca3af'
  },
  meetingList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
    gap: '2rem'
  },
  meetingCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderBottom: '1px solid #e5e7eb'
  },
  meetingTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  roomName: {
    marginTop: '0.5rem',
    fontSize: '0.95rem',
    color: '#6b7280'
  },
  statusBadge: {
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid'
  },
  cardContent: {
    padding: '1.5rem'
  },
  infoSection: {
    marginBottom: '1.5rem'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem'
  },
  infoIcon: {
    fontSize: '1.25rem',
    width: '1.5rem',
    textAlign: 'center'
  },
  infoText: {
    flex: 1,
    fontSize: '0.95rem',
    color: '#374151'
  },
  duration: {
    marginLeft: '0.5rem',
    color: '#6b7280',
    fontSize: '0.875rem'
  },
  section: {
    marginBottom: '1.5rem'
  },
  sectionLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  equipmentSection: {
    marginBottom: '1.5rem'
  },
  equipmentTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  equipmentTag: {
    background: '#f0fdf4',
    color: '#166534',
    padding: '0.35rem 0.85rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: '1px solid #86efac'
  },
  descriptionSection: {
    marginBottom: '1.5rem'
  },
  description: {
    background: '#f9fafb',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#4b5563',
    lineHeight: '1.6',
    border: '1px solid #e5e7eb'
  },
  serviceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem'
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#eff6ff',
    borderRadius: '8px',
    border: '1px solid #bfdbfe'
  },
  serviceIcon: {
    fontSize: '1.5rem'
  },
  serviceInfo: {
    flex: 1
  },
  serviceName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '0.25rem'
  },
  serviceDesc: {
    fontSize: '0.8rem',
    color: '#6b7280'
  },
  serviceQuantity: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#4b5563',
    marginTop: '0.25rem'
  },
  servicePrice: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#059669',
    marginTop: '0.25rem'
  },
  participantGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.75rem'
  },
  participantItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  participantAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1rem'
  },
  participantInfo: {
    flex: 1
  },
  participantName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1f2937'
  },
  participantEmail: {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.15rem'
  },
  participantRole: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginTop: '0.15rem'
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  fileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#fffbeb',
    borderRadius: '8px',
    border: '1px solid #fcd34d'
  },
  fileIcon: {
    fontSize: '1.5rem'
  },
  fileInfo: {
    flex: 1
  },
  fileName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#92400e'
  },
  fileSize: {
    fontSize: '0.75rem',
    color: '#d97706',
    marginTop: '0.15rem'
  },
  downloadButton: {
    padding: '0.5rem 1rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  noData: {
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#9ca3af',
    textAlign: 'center',
    border: '1px dashed #d1d5db'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb'
  },
  footerInfo: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  cancelButton: {
    padding: '0.6rem 1.25rem',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s'
  }
};

export default MyMeetings;
