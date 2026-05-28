#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 开始自动化测试...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// 1. 检查 app.json 格式
console.log('📁 检查配置文件...\n');
const appJsonPath = path.join(__dirname, 'dist/app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));

test('app.json 是有效JSON', () => {
  assert(appJson.pages && Array.isArray(appJson.pages), 'pages 字段缺失或不是数组');
  assert(appJson.pages.length > 0, 'pages 数组为空');
});

test('app.json 无无效字段', () => {
  const validFields = ['pages', 'permission', 'requiredBackgroundModes', 'preloadRule', 'tabBar', 'networkTimeout', 'debug'];
  const invalidFields = Object.keys(appJson).filter(k => !validFields.includes(k));
  assert(invalidFields.length === 0, `发现无效字段: ${invalidFields.join(', ')}`);
});

// 2. 检查所有页面文件
console.log('\n📄 检查页面文件...\n');
const pages = [
  'ParadisePage', 'MainWorldPage', 'DailyChallengePage', 'FunQuizPage',
  'ErrorBookPage', 'PetHousePage', 'CardCenterPage', 'ProfilePage',
  'ClassroomPage', 'ArenaPage', 'PrincipalOfficePage', 'CardWarehousePage', 'QuestCenterPage'
];

pages.forEach(page => {
  test(`页面 ${page} 存在`, () => {
    const pagePath = path.join(__dirname, `dist/pages/${page}/index.js`);
    assert(fs.existsSync(pagePath), `文件不存在: ${pagePath}`);
  });

  test(`页面 ${page} JSON配置存在`, () => {
    const configPath = path.join(__dirname, `dist/pages/${page}/index.json`);
    assert(fs.existsSync(configPath), `文件不存在: ${configPath}`);
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    assert(config.component === true || config.usingComponents, '无效的页面配置');
  });
});

// 3. 检查核心文件
console.log('\n📦 检查核心文件...\n');
const coreFiles = ['app.js', 'app.json', 'runtime.js', 'taro.js', 'vendors.js'];
coreFiles.forEach(file => {
  test(`核心文件 ${file} 存在`, () => {
    const filePath = path.join(__dirname, `dist/${file}`);
    assert(fs.existsSync(filePath), `文件不存在: ${filePath}`);
    const stats = fs.statSync(filePath);
    assert(stats.size > 0, `文件为空: ${filePath}`);
  });
});

// 4. 检查 app.json 中的页面路径
console.log('\n🔗 检查页面路径...\n');
appJson.pages.forEach(pagePath => {
  test(`页面路径 ${pagePath} 有效`, () => {
    const fullPath = path.join(__dirname, `dist/${pagePath}.js`);
    assert(fs.existsSync(fullPath), `文件不存在: ${fullPath}`);
  });
});

// 5. 检查 StorageManager
console.log('\n💾 检查存储管理...\n');
const storagePath = path.join(__dirname, 'dist/common.js');
const storageContent = fs.readFileSync(storagePath, 'utf-8');

test('StorageManager 代码包含', () => {
  assert(storageContent.includes('learningProgress'), '存储key缺失');
  assert(storageContent.includes('signIn'), '签到功能缺失');
  assert(storageContent.includes('rankInfo'), '段位信息缺失');
  assert(storageContent.includes('dailyTasks'), '每日任务缺失');
});

console.log('\n========================================');
console.log(`测试结果: ${passed} 通过, ${failed} 失败`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 所有测试通过!\n');
  process.exit(0);
}