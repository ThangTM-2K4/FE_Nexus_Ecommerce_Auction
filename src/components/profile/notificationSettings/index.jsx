import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import * as notificationSettingsService from '../../../services/notificationSettingsService';
import ToggleGroup from './toggleGroup';
import './index.scss';

const SECTION_SUBTITLE =
  'Thông báo và nhắc nhở quan trọng về tài khoản sẽ không thể bị tắt';

const GROUP_CONFIG = {
  email: {
    title: 'Email thông báo',
    itemLabels: {
      orderUpdates: 'Cập nhật đơn hàng',
      promotions: 'Khuyến mãi',
      surveys: 'Khảo sát',
    },
  },
  sms: {
    title: 'Thông báo SMS',
    itemLabels: { promotions: 'Khuyến mãi' },
  },
  zalo: {
    title: 'Thông báo Zalo',
    itemLabels: { promotions: 'Khuyến mãi (Shopee Việt Nam)' },
  },
};

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    notificationSettingsService.getNotificationSettings(user.id).then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, [user?.id]);

  const handleGroupToggle = async (groupKey, value) => {
    const updated = await notificationSettingsService.toggleNotificationGroup(
      user.id,
      groupKey,
      value,
    );
    setSettings(updated);
  };

  const handleItemToggle = async (groupKey, itemKey, value) => {
    const updated = await notificationSettingsService.toggleGroupItem(
      user.id,
      groupKey,
      itemKey,
      value,
    );
    setSettings(updated);
  };

  if (loading) {
    return <p className="notif-settings__loading">Đang tải cài đặt...</p>;
  }

  const groupKeys = Object.keys(GROUP_CONFIG);

  return (
    <div className="notif-settings">
      <h1 className="notif-settings__title">Cài Đặt Thông Báo</h1>
      <hr className="notif-settings__divider notif-settings__divider--header" />

      {groupKeys.map((groupKey, idx) => {
        const config = GROUP_CONFIG[groupKey];
        const group = settings[groupKey];
        const items = Object.entries(group.items).map(([key, item]) => ({
          key,
          label: config.itemLabels[key],
          description: item.description,
          enabled: item.enabled,
        }));

        return (
          <div key={groupKey} className="notif-settings__section">
            <ToggleGroup
              title={config.title}
              description={SECTION_SUBTITLE}
              enabled={group.enabled}
              onToggle={(value) => handleGroupToggle(groupKey, value)}
              items={items}
              onItemToggle={(itemKey, value) => handleItemToggle(groupKey, itemKey, value)}
            />
            {idx < groupKeys.length - 1 && (
              <hr className="notif-settings__divider notif-settings__divider--section" />
            )}
          </div>
        );
      })}
    </div>
  );
}
