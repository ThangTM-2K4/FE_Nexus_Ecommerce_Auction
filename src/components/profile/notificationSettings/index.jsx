import { useEffect, useState } from "react";
import * as notificationSettingsService from "../../../services/notificationSettingsService";
import "./index.scss";

const DEFAULT_SETTINGS = {
  emailEnabled: true,
  pushEnabled: true,
  smsEnabled: false,
};

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await notificationSettingsService.getNotificationPreferences();

        setSettings({
          emailEnabled: data?.emailEnabled ?? true,
          pushEnabled: data?.pushEnabled ?? true,
          smsEnabled: data?.smsEnabled ?? false,
        });
      } catch (exception) {
        console.error(
          "[NotificationSettingsPage] Failed to load preferences",
          exception,
        );

        setError("Không thể tải cài đặt thông báo.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = async (field, value) => {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [field]: value,
    };

    setSettings(nextSettings);
    setSavingField(field);
    setError("");
    setSuccessMessage("");

    try {
      const updated =
        await notificationSettingsService.updateNotificationPreferences(
          nextSettings,
        );

      setSettings({
        emailEnabled: updated?.emailEnabled ?? nextSettings.emailEnabled,
        pushEnabled: updated?.pushEnabled ?? nextSettings.pushEnabled,
        smsEnabled: updated?.smsEnabled ?? nextSettings.smsEnabled,
      });

      setSuccessMessage("Đã cập nhật cài đặt thông báo.");
    } catch (exception) {
      console.error(
        "[NotificationSettingsPage] Failed to update preferences",
        exception,
      );

      setSettings(previousSettings);
      setError("Không thể cập nhật cài đặt thông báo.");
    } finally {
      setSavingField("");
    }
  };

  if (loading) {
    return <p className="notif-settings__loading">Đang tải cài đặt...</p>;
  }

  return (
    <div className="notif-settings">
      <h1 className="notif-settings__title">Cài đặt thông báo</h1>

      <p className="notif-settings__subtitle">
        Thông báo giao dịch quan trọng về đơn hàng và thanh toán có thể vẫn được
        gửi để bảo đảm an toàn tài khoản.
      </p>

      <hr className="notif-settings__divider notif-settings__divider--header" />

      <PreferenceRow
        title="Email thông báo"
        description="Nhận thông báo giao dịch và cập nhật tài khoản qua email."
        checked={settings.emailEnabled}
        disabled={savingField === "emailEnabled"}
        onChange={(value) => handleToggle("emailEnabled", value)}
      />

      <hr className="notif-settings__divider notif-settings__divider--section" />

      <PreferenceRow
        title="Thông báo đẩy"
        description="Nhận cập nhật nhanh về đơn hàng và phiên đấu giá."
        checked={settings.pushEnabled}
        disabled={savingField === "pushEnabled"}
        onChange={(value) => handleToggle("pushEnabled", value)}
      />

      <hr className="notif-settings__divider notif-settings__divider--section" />

      <PreferenceRow
        title="Thông báo SMS"
        description="Nhận một số thông báo quan trọng qua tin nhắn SMS."
        checked={settings.smsEnabled}
        disabled={savingField === "smsEnabled"}
        onChange={(value) => handleToggle("smsEnabled", value)}
      />

      {successMessage && (
        <p className="notif-settings__success">{successMessage}</p>
      )}

      {error && <p className="notif-settings__error">{error}</p>}
    </div>
  );
}

function PreferenceRow({ title, description, checked, disabled, onChange }) {
  return (
    <div className="notif-settings__row">
      <div className="notif-settings__row-content">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <label className="notif-settings__switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />

        <span className="notif-settings__slider" />
      </label>
    </div>
  );
}
