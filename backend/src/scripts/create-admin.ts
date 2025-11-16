import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import bcrypt from 'bcryptjs';

async function createAdminAndPsychologist() {
  try {
    console.log('📦 Инициализация подключения к базе данных...');
    await AppDataSource.initialize();

    const userRepository = AppDataSource.getRepository(User);

    // Проверяем, существует ли уже админ
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@test.com' },
    });

    if (existingAdmin) {
      console.log('⚠️  Администратор уже существует');
    } else {
      // Создаем админа
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = userRepository.create({
        email: 'admin@test.com',
        username: 'admin',
        password: adminPassword,
        role: UserRole.ADMIN,
        firstName: 'Администратор',
        lastName: 'Системы',
      });
      await userRepository.save(admin);
      console.log('✅ Администратор создан!');
      console.log('   Email: admin@test.com');
      console.log('   Password: admin123');
    }

    // Проверяем, существует ли уже психолог
    const existingPsych = await userRepository.findOne({
      where: { email: 'psychologist@test.com' },
    });

    if (existingPsych) {
      console.log('⚠️  Психолог уже существует');
    } else {
      // Создаем психолога
      const psychPassword = await bcrypt.hash('psych123', 10);
      const psychologist = userRepository.create({
        email: 'psychologist@test.com',
        username: 'psychologist',
        password: psychPassword,
        role: UserRole.PSYCHOLOGIST,
        firstName: 'Психолог',
        lastName: 'Тестовый',
      });
      await userRepository.save(psychologist);
      console.log('✅ Психолог создан!');
      console.log('   Email: psychologist@test.com');
      console.log('   Password: psych123');
    }

    console.log('\n🎉 Готово!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

createAdminAndPsychologist();


