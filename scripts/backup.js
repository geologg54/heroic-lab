/**
 * Скрипт для резервного копирования базы данных SQLite (dev.db)
 * 
 * Как работает:
 * 1. Копирует файл базы данных в папку backups с именем, содержащим дату и время.
 * 2. Удаляет файлы старше 30 дней (можно настроить).
 * 
 * Запускать ежедневно через планировщик задач (Windows Task Scheduler) или cron.
 * 
 * Пример команды: npm run backup
 */

const fs = require('fs');
const path = require('path');

// ================= НАСТРОЙКИ =================
// Путь к файлу базы данных (укажи абсолютный путь)
const DB_PATH = 'X:/server/dev.db';

// Папка для хранения резервных копий
const BACKUP_DIR = 'X:/server/backups';

// Сколько дней хранить резервные копии (0 = не удалять)
const RETENTION_DAYS = 30;
// =============================================

/**
 * Форматирует дату в строку YYYY-MM-DD_HH-mm-ss
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Создаёт резервную копию базы данных
 */
function createBackup() {
  // Проверяем, существует ли исходный файл
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Файл базы данных не найден: ${DB_PATH}`);
    process.exit(1);
  }

  // Создаём папку для резервных копий, если её нет
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Создана папка для резервных копий: ${BACKUP_DIR}`);
  }

  // Формируем имя файла резервной копии
  const timestamp = formatDate(new Date());
  const backupFileName = `dev_${timestamp}.db`;
  const backupFilePath = path.join(BACKUP_DIR, backupFileName);

  try {
    // Копируем файл
    fs.copyFileSync(DB_PATH, backupFilePath);
    console.log(`✅ Резервная копия создана: ${backupFilePath}`);
  } catch (error) {
    console.error(`❌ Ошибка при копировании: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Удаляет резервные копии старше указанного количества дней
 */
function cleanupOldBackups() {
  if (RETENTION_DAYS <= 0) {
    console.log('ℹ️ Автоматическое удаление старых копий отключено (RETENTION_DAYS = 0)');
    return;
  }

  const now = Date.now();
  const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  // Читаем все файлы из папки backups
  const files = fs.readdirSync(BACKUP_DIR);
  let deletedCount = 0;

  files.forEach(file => {
    // Пропускаем не .db файлы
    if (!file.endsWith('.db')) return;

    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtimeMs;

    if (fileAge > maxAgeMs) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Удалена старая копия: ${file}`);
      } catch (error) {
        console.error(`⚠️ Не удалось удалить ${file}: ${error.message}`);
      }
    }
  });

  if (deletedCount > 0) {
    console.log(`🧹 Удалено старых копий: ${deletedCount}`);
  } else {
    console.log('ℹ️ Старых копий для удаления не найдено');
  }
}

// ========== ЗАПУСК ==========
console.log('🚀 Запуск резервного копирования базы данных...');
createBackup();
cleanupOldBackups();
console.log('✨ Готово.');