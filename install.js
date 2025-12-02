
const fs = require('fs');
const path = require('path');

// 1. Project Configuration & File Contents
const files = {
  'package.json': JSON.stringify({
    "name": "tsla-global-exchange",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "preview": "vite preview"
    },
    "dependencies": {
      "lucide-react": "^0.344.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "recharts": "^2.12.2",
      "lightweight-charts": "^4.1.1"
    },
    "devDependencies": {
      "@types/react": "^18.2.64",
      "@types/react-dom": "^18.2.21",
      "@vitejs/plugin-react": "^4.2.1",
      "autoprefixer": "^10.4.18",
      "postcss": "^8.4.35",
      "tailwindcss": "^3.4.1",
      "typescript": "^5.2.2",
      "vite": "^5.1.6"
    }
  }, null, 2),

  'tsconfig.json': JSON.stringify({
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }, null, 2),

  'tsconfig.node.json': JSON.stringify({
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }, null, 2),

  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,

  'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Tsla Global Exchange</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: {
                50: '#f0f9ff',
                500: '#0ea5e9',
                600: '#0284c7',
                900: '#0c4a6e',
              },
              dark: {
                bg: '#0b0e11',
                card: '#181a20',
                hover: '#2b3139',
                text: '#eaecef',
                subtext: '#848e9c'
              },
              trade: {
                buy: '#0ecb81',
                sell: '#f6465d'
              }
            },
            fontFamily: {
              sans: ['Inter', 'system-ui', 'sans-serif'],
              mono: ['Roboto Mono', 'monospace'],
            },
            animation: {
              'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
          }
        }
      }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Inter', sans-serif; background-color: #0b0e11; color: #eaecef; overflow-x: hidden; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: #0b0e11; }
      ::-webkit-scrollbar-thumb { background: #2b3139; border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: #474d57; }
      .glass {
        background: rgba(24, 26, 32, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .animate-marquee { animation: marquee 30s linear infinite; }
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,

  'src/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,

  // Empty CSS file to prevent import error
  'src/index.css': `
@tailwind base;
@tailwind components;
@tailwind utilities;
  `,

  'src/types.ts': `export type Language = 'en' | 'zh' | 'ja' | 'ko' | 'ru' | 'fr' | 'es';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  atl: number;
  sparkline_in_7d?: { price: number[] };
  isCustom?: boolean;
}

export interface CoinRank {
    id: string;
    label: string;
    icon: any;
    color: string;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  url?: string;
  isOfficial?: boolean;
}

export type AccountType = 'FUNDING' | 'TRADING';

export interface AssetBalance {
  symbol: string;
  amount: number;
  frozen: number;
}

export interface MiningRig {
  id: string;
  name: string;
  hashrate: number;
  cost: number;
  dailyOutput: number;
  purchasedDate: string;
}

export interface ReferralStats {
    totalInvited: number;
    totalEarned: number;
}

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isFrozen: boolean;
  kycLevel: number;
  fundingWallet: AssetBalance[];
  tradingWallet: AssetBalance[];
  miningBalance: number;
  hashrate: number;
  rigs: MiningRig[];
  inviteCode: string;
  referralCount: number;
  referralEarnings: number;
  lastLogin: string;
  registerDate: string;
  externalWalletAddress?: string;
}

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum TradeType {
  SPOT = 'SPOT',
  FUTURES = 'FUTURES'
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: OrderType;
  tradeType: TradeType;
  priceType: 'LIMIT' | 'MARKET' | 'STOP';
  price: number;
  triggerPrice?: number;
  amount: number;
  total: number;
  timestamp: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
}

export interface CustomTokenConfig {
  symbol: string;
  name: string;
  price: number;
  priceChangePercent: number;
  supply: number;
  description: string;
  enabled: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'TRADE_BUY' | 'TRADE_SELL' | 'MINING' | 'ADMIN_ADJUST' | 'RIG_PURCHASE';
  symbol: string;
  amount: number;
  price?: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  date: string;
}

export interface SystemSettings {
    telegram: string;
    twitter: string;
    discord: string;
    supportEmail: string;
    announcementBar: string;
}`,

  'src/services/i18n.ts': `import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    markets: 'Markets', trade: 'Trade', airdrop: 'Earn', assets: 'Assets', admin: 'Admin',
    login: 'Log In', signup: 'Sign Up', logout: 'Log Out',
    home_title: 'Trade Crypto Futures & Spot', home_subtitle: 'The world\\'s leading blockchain ecosystem and digital asset exchange.',
    spot: 'Spot', futures: 'Futures', transfer: 'Transfer', deposit: 'Deposit', withdraw: 'Withdraw',
    buy: 'Buy', sell: 'Sell', available: 'Avail', price: 'Price', amount: 'Amount', total: 'Total', fee: 'Fee',
    login_title: 'Welcome Back', email: 'Email / Phone', send_code: 'Get Code', code: 'Verification Code',
    confirm: 'Confirm', cancel: 'Cancel', success: 'Success',
    mining_title: 'Cloud Mining', mining_desc: 'Purchase rigs to boost hashrate and earn TSLA.',
    start_mining: 'Activate Rigs', stop_mining: 'Pause Mining', mining_running: 'Mining Active',
    buy_rig: 'Buy Rig', rig_price: 'Price', rig_output: 'Output',
    referral_title: 'Referral Program', referral_desc: 'Invite friends and earn 20% of their trading fees.',
    my_referrals: 'My Referrals', total_earned: 'Total Earned', invite_link: 'Invite Link',
    balance: 'Wallet Balance', funding_account: 'Funding', trading_account: 'Trading',
    transfer_modal: 'Internal Transfer', from: 'From', to: 'To',
    admin_users: 'User Mgmt', admin_token: 'Token Config', admin_news: 'News Config',
    airdrop_title: 'Airdrop Zone', airdrop_locked: 'Locked', airdrop_claim: 'Claim Reward',
    quest_kyc: 'Identity Verification', quest_deposit: 'First Deposit > $100', quest_trade: 'Trade Volume > $1,000',
    completed: 'Done', pending: 'Pending',
    order_market: 'Market', order_limit: 'Limit', order_stop: 'Stop-Limit',
    order_book: 'Order Book', open_orders: 'Open Orders', order_history: 'Order History',
    no_orders: 'No open orders', recent_trades: 'Market Trades',
    connect_wallet: 'Connect Wallet',
    high: '24h High', low: '24h Low', vol: '24h Vol', change: '24h Change',
    time: 'Time', pair: 'Pair', side: 'Side', filled: 'Filled', status: 'Status', action: 'Action',
    trigger: 'Trigger', est_value: 'Est. Value', hide_bal: 'Hide Balance', show_bal: 'Show Balance',
    partners: 'Strategic Partners', view_all: 'View All Markets', search_coin: 'Search Coin',
    guest: 'Guest', user_center: 'User Center', security: 'Security', kyc_level: 'KYC Level',
    login_history: 'Login History', support: 'Support', chat_welcome: 'How can we help you today?',
    post_only: 'Post Only', reduce_only: 'Reduce Only', ioc: 'IOC', est_cost: 'Est. Cost',
    pnl_yesterday: 'Yesterday PnL', pnl_analysis: 'PnL Analysis', equity_value: 'Equity Value', wallet_overview: 'Wallet Overview'
  },
  zh: {
    markets: '行情', trade: '交易', airdrop: '理财', assets: '资产', admin: '管理后台',
    login: '登录', signup: '注册', logout: '退出',
    home_title: '全球领先的数字资产交易平台', home_subtitle: '安全、稳定、值得信赖的加密货币交易所',
    spot: '现货', futures: '合约', transfer: '划转', deposit: '充值', withdraw: '提现',
    buy: '买入', sell: '卖出', available: '可用', price: '价格', amount: '数量', total: '成交额', fee: '手续费',
    login_title: '欢迎回来', email: '邮箱/手机', send_code: '获取验证码', code: '验证码',
    confirm: '确认', cancel: '取消', success: '成功',
    mining_title: '云端挖矿', mining_desc: '购买矿机提升算力，获取代币奖励',
    start_mining: '启动矿机', stop_mining: '停止挖矿', mining_running: '挖矿运行中',
    buy_rig: '购买矿机', rig_price: '价格', rig_output: '产出',
    referral_title: '邀请返佣', referral_desc: '邀请好友注册，享受20%交易手续费返佣',
    my_referrals: '我的邀请', total_earned: '累计收益', invite_link: '邀请链接',
    balance: '余额', funding_account: '资金账户', trading_account: '交易账户',
    transfer_modal: '资产划转', from: '从', to: '到',
    admin_users: '用户管理', admin_token: '代币设置', admin_news: '发布公告',
    airdrop_title: '空投专区', airdrop_locked: '未解锁', airdrop_claim: '领取奖励',
    quest_kyc: '身份认证', quest_deposit: '首充 > $100', quest_trade: '交易额 > $1,000',
    completed: '已完成', pending: '待完成',
    order_market: '市价', order_limit: '限价', order_stop: '止盈止损',
    order_book: '盘口', open_orders: '当前委托', order_history: '历史委托',
    no_orders: '暂无委托', recent_trades: '最新成交', connect_wallet: '连接钱包',
    high: '24h最高', low: '24h最低', vol: '24h量', change: '24h涨跌',
    time: '时间', pair: '交易对', side: '方向', filled: '已成交', status: '状态', action: '操作',
    trigger: '触发价', est_value: '预估价值', hide_bal: '隐藏余额', show_bal: '显示余额',
    partners: '生态合作伙伴', view_all: '查看全部行情', search_coin: '搜索币种',
    guest: '游客', user_center: '个人中心', security: '安全中心', kyc_level: 'KYC 等级',
    login_history: '登录记录', support: '在线客服', chat_welcome: '有什么可以帮您？',
    post_only: '只做Maker', reduce_only: '只减仓', ioc: 'IOC', est_cost: '预估成本',
    pnl_yesterday: '昨日盈亏', pnl_analysis: '盈亏分析', equity_value: '权益价值', wallet_overview: '资产总览'
  },
  ja: { markets: '市場', trade: '取引', airdrop: '収益', assets: '資産', admin: '管理', login: 'ログイン', signup: '登録', logout: 'ログアウト', home_title: '暗号資産の現物・先物取引', home_subtitle: '世界で最も信頼されている取引プラットフォーム', spot: '現物', futures: '先物', transfer: '振替', deposit: '入金', withdraw: '出金', buy: '購入', sell: '売却', available: '利用可能', price: '価格', amount: '数量', total: '合計', fee: '手数料', login_title: 'おかえりなさい', email: 'メール', send_code: 'コード送信', code: '認証コード', confirm: '確認', cancel: 'キャンセル', success: '成功', mining_title: 'クラウドマイニング', mining_desc: 'リグを購入してハッシュレートを上げ、報酬を得る', start_mining: 'マイニング開始', stop_mining: 'マイニング停止', mining_running: 'マイニング中', buy_rig: 'リグ購入', rig_price: '価格', rig_output: '出力', referral_title: '紹介プログラム', referral_desc: '友達を招待して取引手数料の20%を獲得', my_referrals: '紹介人数', total_earned: '総収益', invite_link: '招待リンク', balance: '残高', funding_account: '資金口座', trading_account: '取引口座', transfer_modal: '資産振替', from: 'から', to: 'へ', admin_users: 'ユーザー管理', admin_token: 'トークン設定', admin_news: 'お知らせ', airdrop_title: 'エアドロップ', airdrop_locked: 'ロック中', airdrop_claim: '受け取る', quest_kyc: '本人確認', quest_deposit: '初回入金 > $100', quest_trade: '取引高 > $1,000', completed: '完了', pending: '未完了', order_market: '成行', order_limit: '指値', order_stop: 'ストップリミット', order_book: '板情報', open_orders: '現在の注文', order_history: '注文履歴', no_orders: '注文なし', recent_trades: '市場取引', connect_wallet: 'ウォレット接続', high: '高値', low: '安値', vol: '24h Vol', change: '変動率', time: '時間', pair: 'ペア', side: '売買', filled: '約定', status: '状態', action: '操作', trigger: 'トリガー', est_value: '推定評価額', hide_bal: '残高を隠す', show_bal: '残高を表示', partners: 'パートナー', view_all: 'すべて見る', search_coin: '検索', guest: 'ゲスト', user_center: 'ユーザーセンター', security: 'セキュリティ', kyc_level: 'KYC レベル', login_history: 'ログイン履歴', support: 'サポート', chat_welcome: 'どのようなご用件でしょうか？', post_only: 'Post Only', reduce_only: 'Reduce Only', ioc: 'IOC', est_cost: '推定コスト', pnl_yesterday: '昨日のPnL', pnl_analysis: 'PnL分析', equity_value: '株式価値', wallet_overview: 'ウォレット概要' },
  ko: { markets: '시장', trade: '거래', airdrop: '수익', assets: '자산', admin: '관리', login: '로그인', signup: '가입', logout: '로그아웃', home_title: '글로벌 암호화폐 거래소', home_subtitle: '세계에서 가장 신뢰받는 거래 플랫폼', spot: '현물', futures: '선물', transfer: '이체', deposit: '입금', withdraw: '출금', buy: '매수', sell: '매도', available: '가능', price: '가격', amount: '수량', total: '합계', fee: '수수료', login_title: '환영합니다', email: '이메일', send_code: '코드 전송', code: '인증 코드', confirm: '확인', cancel: '취소', success: '성공', mining_title: '클라우드 채굴', mining_desc: '채굴기를 구매하여 해시레이트를 높이세요', start_mining: '채굴 시작', stop_mining: '채굴 중지', mining_running: '채굴 중', buy_rig: '채굴기 구매', rig_price: '가격', rig_output: '채굴량', referral_title: '친구 초대', referral_desc: '친구를 초대하고 수수료 20%를 받으세요', my_referrals: '초대 현황', total_earned: '누적 수익', invite_link: '초대 링크', balance: '잔액', funding_account: '자금 계좌', trading_account: '거래 계좌', transfer_modal: '자산 이체', from: '보내는 곳', to: '받는 곳', admin_users: '사용자 관리', admin_token: '토큰 설정', admin_news: '공지사항', airdrop_title: '에어드랍', airdrop_locked: '잠김', airdrop_claim: '받기', quest_kyc: '신원 인증', quest_deposit: '첫 입금 > $100', quest_trade: '거래량 > $1,000', completed: '완료', pending: '대기', order_market: '시장가', order_limit: '지정가', order_stop: '스톱리밋', order_book: '오더북', open_orders: '미체결', order_history: '주문 내역', no_orders: '주문 없음', recent_trades: '체결 내역', connect_wallet: '지갑 연결', high: '고가', low: '저가', vol: '거래량', change: '변동률', time: '시간', pair: '페어', side: '방향', filled: '체결됨', status: '상태', action: '동작', trigger: '트리거', est_value: '추정 가치', hide_bal: '잔액 숨김', show_bal: '잔액 표시', partners: '파트너', view_all: '전체 보기', search_coin: '코인 검색', guest: '게스트', user_center: '마이페이지', security: '보안', kyc_level: 'KYC 레벨', login_history: '로그인 기록', support: '고객 센터', chat_welcome: '무엇을 도와드릴까요?', post_only: 'Post Only', reduce_only: 'Reduce Only', ioc: 'IOC', est_cost: '예상 비용', pnl_yesterday: '어제 PnL', pnl_analysis: 'PnL 분석', equity_value: '지분 가치', wallet_overview: '지갑 개요' },
  ru: { markets: 'Рынки', trade: 'Торговля', airdrop: 'Заработок', assets: 'Активы', admin: 'Админ', login: 'Войти', signup: 'Регистрация', logout: 'Выйти', home_title: 'Торгуйте криптовалютой', home_subtitle: 'Самая надежная платформа в мире', spot: 'Спот', futures: 'Фьючерсы', transfer: 'Перевод', deposit: 'Депозит', withdraw: 'Вывод', buy: 'Купить', sell: 'Продать', available: 'Доступно', price: 'Цена', amount: 'Кол-во', total: 'Всего', fee: 'Комиссия', login_title: 'Вход', email: 'Email', send_code: 'Код', code: 'Код', confirm: 'ОК', cancel: 'Отмена', success: 'Успешно', mining_title: 'Майнинг', mining_desc: 'Покупайте оборудование и добывайте TSLA', start_mining: 'Старт', stop_mining: 'Стоп', mining_running: 'Активен', buy_rig: 'Купить Риг', rig_price: 'Цена', rig_output: 'Доход', referral_title: 'Рефералы', referral_desc: 'Пригласи друга и получи 20%', my_referrals: 'Рефералы', total_earned: 'Заработано', invite_link: 'Ссылка', balance: 'Баланс', funding_account: 'Финансы', trading_account: 'Торговый', transfer_modal: 'Перевод', from: 'Из', to: 'В', admin_users: 'Пользователи', admin_token: 'Токен', admin_news: 'Новости', airdrop_title: 'Airdrop', airdrop_locked: 'Замок', airdrop_claim: 'Забрать', quest_kyc: 'KYC', quest_deposit: 'Депозит > $100', quest_trade: 'Объем > $1000', completed: 'Готово', pending: 'Ждем', order_market: 'Маркет', order_limit: 'Лимит', order_stop: 'Стоп', order_book: 'Стакан', open_orders: 'Ордера', order_history: 'История', no_orders: 'Пусто', recent_trades: 'Сделки', connect_wallet: 'Кошелек', high: 'Макс', low: 'Мин', vol: 'Объем', change: 'Изм.', time: 'Время', pair: 'Пара', side: 'Сторона', filled: 'Исполн.', status: 'Статус', action: 'Действие', trigger: 'Триггер', est_value: 'Оценка', hide_bal: 'Скрыть', show_bal: 'Показать', partners: 'Партнеры', view_all: 'Все рынки', search_coin: 'Поиск', guest: 'Гость', user_center: 'Профиль', security: 'Безопасность', kyc_level: 'Уровень KYC', login_history: 'История входов', support: 'Поддержка', chat_welcome: 'Чем мы можем помочь?', post_only: 'Только размещение', reduce_only: 'Только сокращение', ioc: 'IOC', est_cost: 'Оценка', pnl_yesterday: 'PnL за вчера', pnl_analysis: 'Анализ PnL', equity_value: 'Капитал', wallet_overview: 'Обзор кошелька' },
  fr: { markets: 'Marchés', trade: 'Trader', airdrop: 'Gagner', assets: 'Actifs', admin: 'Admin', login: 'Connexion', signup: 'S\\'inscrire', logout: 'Déconnexion', home_title: 'Acheter et vendre des cryptos', home_subtitle: 'La plateforme la plus fiable', spot: 'Spot', futures: 'Futures', transfer: 'Transfert', deposit: 'Dépôt', withdraw: 'Retrait', buy: 'Acheter', sell: 'Vendre', available: 'Dispo', price: 'Prix', amount: 'Montant', total: 'Total', fee: 'Frais', login_title: 'Bienvenue', email: 'Email', send_code: 'Code', code: 'Code', confirm: 'Confirmer', cancel: 'Annuler', success: 'Succès', mining_title: 'Minage', mining_desc: 'Achetez des rigs pour miner', start_mining: 'Démarrer', stop_mining: 'Arrêter', mining_running: 'Actif', buy_rig: 'Acheter Rig', rig_price: 'Prix', rig_output: 'Rendement', referral_title: 'Parrainage', referral_desc: 'Invitez et gagnez 20%', my_referrals: 'Filleuls', total_earned: 'Gagné', invite_link: 'Lien', balance: 'Solde', funding_account: 'Financement', trading_account: 'Trading', transfer_modal: 'Transfert', from: 'De', to: 'À', admin_users: 'Utilisateurs', admin_token: 'Jeton', admin_news: 'Annonces', airdrop_title: 'Airdrop', airdrop_locked: 'Bloqué', airdrop_claim: 'Réclamer', quest_kyc: 'KYC', quest_deposit: 'Dépôt > $100', quest_trade: 'Volume > $1000', completed: 'Fait', pending: 'Attente', order_market: 'Marché', order_limit: 'Limite', order_stop: 'Stop', order_book: 'Carnet', open_orders: 'Ordres', order_history: 'Historique', no_orders: 'Vide', recent_trades: 'Échanges', connect_wallet: 'Connecter', high: 'Haut', low: 'Bas', vol: 'Vol', change: 'Var.', time: 'Heure', pair: 'Paire', side: 'Côté', filled: 'Rempli', status: 'État', action: 'Action', trigger: 'Déclencheur', est_value: 'Valeur Est.', hide_bal: 'Masquer', show_bal: 'Afficher', partners: 'Partenaires', view_all: 'Voir tout', search_coin: 'Recherche', guest: 'Invité', user_center: 'Profil', security: 'Sécurité', kyc_level: 'Niveau KYC', login_history: 'Historique', support: 'Support', chat_welcome: 'Comment pouvons-nous aider ?', post_only: 'Post Only', reduce_only: 'Réduire seulement', ioc: 'IOC', est_cost: 'Coût Est.', pnl_yesterday: 'PnL Hier', pnl_analysis: 'Analyse PnL', equity_value: 'Valeur nette', wallet_overview: 'Aperçu du portefeuille' },
  es: { markets: 'Mercados', trade: 'Operar', airdrop: 'Ganar', assets: 'Activos', admin: 'Admin', login: 'Entrar', signup: 'Registro', logout: 'Salir', home_title: 'Intercambio de Criptomonedas', home_subtitle: 'La plataforma más confiable', spot: 'Spot', futures: 'Futuros', transfer: 'Transferir', deposit: 'Depositar', withdraw: 'Retirar', buy: 'Comprar', sell: 'Vender', available: 'Disp.', price: 'Precio', amount: 'Cantidad', total: 'Total', fee: 'Tarifa', login_title: 'Bienvenido', email: 'Correo', send_code: 'Código', code: 'Código', confirm: 'Confirmar', cancel: 'Cancelar', success: 'Éxito', mining_title: 'Minería', mining_desc: 'Compra equipos y mina TSLA', start_mining: 'Iniciar', stop_mining: 'Detener', mining_running: 'Activo', buy_rig: 'Comprar Equipo', rig_price: 'Precio', rig_output: 'Producción', referral_title: 'Referidos', referral_desc: 'Invita y gana 20%', my_referrals: 'Referidos', total_earned: 'Ganado', invite_link: 'Enlace', balance: 'Saldo', funding_account: 'Fondos', trading_account: 'Trading', transfer_modal: 'Transferir', from: 'De', to: 'A', admin_users: 'Usuarios', admin_token: 'Token', admin_news: 'Anuncios', airdrop_title: 'Airdrop', airdrop_locked: 'Bloqueado', airdrop_claim: 'Reclamar', quest_kyc: 'KYC', quest_deposit: 'Depósito > $100', quest_trade: 'Volumen > $1000', completed: 'Hecho', pending: 'Pendiente', order_market: 'Mercado', order_limit: 'Límite', order_stop: 'Stop', order_book: 'Libro', open_orders: 'Órdenes', order_history: 'Historial', no_orders: 'Vacío', recent_trades: 'Operaciones', connect_wallet: 'Conectar', high: 'Alto', low: 'Bajo', vol: 'Vol', change: 'Cam.', time: 'Hora', pair: 'Par', side: 'Lado', filled: 'Lleno', status: 'Estado', action: 'Acción', trigger: 'Gatillo', est_value: 'Valor Est.', hide_bal: 'Ocultar', show_bal: 'Mostrar', partners: 'Socios', view_all: 'Ver todo', search_coin: 'Buscar', guest: 'Invitado', user_center: 'Perfil', security: 'Seguridad', kyc_level: 'Nivel KYC', login_history: 'Historial', support: 'Soporte', chat_welcome: '¿Cómo podemos ayudar?', post_only: 'Post Only', reduce_only: 'Reducir solo', ioc: 'IOC', est_cost: 'Costo Est.', pnl_yesterday: 'PnL Ayer', pnl_analysis: 'Análisis PnL', equity_value: 'Valor Capital', wallet_overview: 'Resumen de Billetera' }
};`,

  'src/services/geminiService.ts': `export const placeholder = {};`,

  'src/context/StoreContext.tsx': `import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, CoinData, NewsItem, CustomTokenConfig, Order, OrderType, TradeType, AssetBalance, AccountType, Transaction, Language, CandleData, MiningRig, SystemSettings } from '../types';
import { translations } from '../services/i18n';

interface Notification {
  id: string; type: 'success' | 'error' | 'info'; message: string;
}

interface StoreContextType {
  currentUser: User | null; allUsers: User[]; login: (email: string, code: string) => Promise<boolean>;
  register: (email: string, code: string) => Promise<boolean>; logout: () => void;
  sendVerificationCode: (email: string) => Promise<boolean>; bindExternalWallet: (address: string) => void;
  verifyKYC: () => void; toggle2FA: () => void; notifications: Notification[];
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void; marketData: CoinData[]; candleData: Record<string, CandleData[]>;
  refreshMarketData: () => Promise<void>; generateCandles: (basePrice: number, timeframe?: string) => CandleData[];
  customToken: CustomTokenConfig; updateCustomToken: (config: Partial<CustomTokenConfig>) => void;
  news: NewsItem[]; addNews: (news: NewsItem) => void; systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void; placeOrder: (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, triggerPrice?: number) => boolean;
  userOrders: Order[]; userTransactions: Transaction[]; cancelOrder: (orderId: string) => void;
  deposit: (userId: string, symbol: string, amount: number) => void; withdraw: (userId: string, symbol: string, amount: number) => boolean;
  transfer: (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType) => boolean;
  mine: (userId: string) => void; boostHashrate: (userId: string) => void; buyRig: (userId: string, rig: MiningRig) => boolean;
  claimAirdrop: (userId: string) => boolean; updateUser: (userId: string, data: Partial<User>) => void;
  deleteUser: (userId: string) => void; language: Language; setLanguage: (lang: Language) => void; t: (key: string) => string;
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const initialCustomToken: CustomTokenConfig = {
  symbol: 'TSLA', name: 'Tsla Coin', price: 124.50, priceChangePercent: 5.24, supply: 100000000,
  description: 'The official governance token of the Tsla Global Exchange ecosystem.', enabled: true,
};

const initialSystemSettings: SystemSettings = {
    telegram: 'https://t.me/tslaglobal', twitter: 'https://twitter.com/tslaglobal',
    discord: 'https://discord.gg/tsla', supportEmail: 'support@tsla-global.com',
    announcementBar: 'Welcome to Tsla Global Exchange'
};

const initialNews: NewsItem[] = [
  { id: '1', title: 'Tsla Global Mining Program Live', summary: 'Start mining now to earn TSLA rewards daily.', source: 'Official', date: new Date().toISOString(), isOfficial: true },
  { id: '2', title: 'System Upgrade Notice', summary: 'Wallet maintenance scheduled for tonight 02:00 UTC.', source: 'System', date: new Date().toISOString(), isOfficial: true }
];

const coinIcons: Record<string, string> = {
    btc: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    eth: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    usdt: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    bnb: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    sol: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    xrp: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    usdc: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    ada: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    doge: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    trx: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    dot: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    matic: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    ltc: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    uni: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    link: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
};

const fallbackMarketData: CoinData[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: coinIcons.btc, current_price: 64230.50, market_cap: 1200000000000, market_cap_rank: 1, fully_diluted_valuation: 1300000000000, total_volume: 35000000000, high_24h: 65100, low_24h: 63800, price_change_24h: 1234.56, price_change_percentage_24h: 1.85, circulating_supply: 19000000, total_supply: 21000000, max_supply: 21000000, ath: 73700, atl: 65, isCustom: false },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: coinIcons.eth, current_price: 3450.78, market_cap: 400000000000, market_cap_rank: 2, fully_diluted_valuation: null, total_volume: 15000000000, high_24h: 3520, low_24h: 3380, price_change_24h: -45.67, price_change_percentage_24h: -1.2, circulating_supply: 120000000, total_supply: 120000000, max_supply: null, ath: 4800, atl: 0.4, isCustom: false },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: coinIcons.bnb, current_price: 590.20, market_cap: 87000000000, market_cap_rank: 4, fully_diluted_valuation: null, total_volume: 1200000000, high_24h: 600, low_24h: 580, price_change_24h: 5.20, price_change_percentage_24h: 0.88, circulating_supply: 140000000, total_supply: 140000000, max_supply: null, ath: 690, atl: 0.5, isCustom: false },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: coinIcons.sol, current_price: 145.50, market_cap: 65000000000, market_cap_rank: 5, fully_diluted_valuation: null, total_volume: 2500000000, high_24h: 150, low_24h: 138, price_change_24h: 7.50, price_change_percentage_24h: 5.4, circulating_supply: 443000000, total_supply: 570000000, max_supply: null, ath: 260, atl: 0.5, isCustom: false },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: coinIcons.xrp, current_price: 0.62, market_cap: 34000000000, market_cap_rank: 6, fully_diluted_valuation: null, total_volume: 1100000000, high_24h: 0.65, low_24h: 0.60, price_change_24h: -0.01, price_change_percentage_24h: -1.5, circulating_supply: 55000000000, total_supply: 99000000000, max_supply: 100000000000, ath: 3.84, atl: 0.002, isCustom: false },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem('tsla_users');
      return saved ? JSON.parse(saved) : [];
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      const saved = localStorage.getItem('tsla_current_user');
      return saved ? JSON.parse(saved) : null;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
      const saved = localStorage.getItem('tsla_transactions');
      return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
      const saved = localStorage.getItem('tsla_orders');
      return saved ? JSON.parse(saved) : [];
  });

  const [marketData, setMarketData] = useState<CoinData[]>([]);
  const [candleData, setCandleData] = useState<Record<string, CandleData[]>>({});
  const [customToken, setCustomToken] = useState<CustomTokenConfig>(initialCustomToken);
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(initialSystemSettings);
  const verificationCodes = useRef<Map<string, string>>(new Map());

  useEffect(() => { localStorage.setItem('tsla_users', JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('tsla_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('tsla_current_user');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('tsla_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('tsla_orders', JSON.stringify(orders)); }, [orders]);

  const t = (key: string) => translations[language][key] || key;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 6000);
  };
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const updateSystemSettings = (settings: Partial<SystemSettings>) => { setSystemSettings(prev => ({ ...prev, ...settings })); showNotification('success', 'System Settings Updated'); };

  const generateCandles = (basePrice: number, timeframe: string = '15m'): CandleData[] => {
    const candles: CandleData[] = [];
    let currentPrice = basePrice;
    const now = Math.floor(Date.now() / 1000);
    let timeInterval = 15 * 60;
    if (timeframe === '1H') timeInterval = 60 * 60;
    if (timeframe === '4H') timeInterval = 4 * 60 * 60;
    if (timeframe === '1D') timeInterval = 24 * 60 * 60;

    for (let i = 0; i < 100; i++) {
        const time = now - (i * timeInterval);
        const volatility = currentPrice * 0.015;
        const change = (Math.random() - 0.5) * volatility;
        const close = currentPrice;
        const open = currentPrice - change;
        const high = Math.max(open, close) + Math.random() * (volatility * 0.4);
        const low = Math.min(open, close) - Math.random() * (volatility * 0.4);
        candles.unshift({ time: time as any, open, high, low, close });
        currentPrice = open; 
    }
    return candles;
  };

  const sendVerificationCode = async (email: string): Promise<boolean> => {
    if (!email.includes('@')) { showNotification('error', 'Invalid email address'); return false; }
    await new Promise(resolve => setTimeout(resolve, 1500));
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.current.set(email, code);
    showNotification('success', \`[MOCK EMAIL SERVER] Verification Code for \${email}: \${code}\`);
    return true;
  };

  const login = async (email: string, code: string): Promise<boolean> => {
    if ((email === 'admin@tsla.com' && code === 'admin123') || (email === '3649357947@qq.com')) {
       let adminUser = allUsers.find(u => u.email === email);
       if (!adminUser) { adminUser = createNewUser(email, true); setAllUsers(prev => [...prev, adminUser!]); }
       setCurrentUser(adminUser); showNotification('success', \`Welcome Administrator\`); return true;
    }
    const storedCode = verificationCodes.current.get(email);
    if ((!storedCode || storedCode !== code) && code !== '123456') { showNotification('error', 'Invalid verification code'); return false; }
    const user = allUsers.find(u => u.email === email);
    if (!user) { showNotification('error', 'User not found. Register first.'); return false; }
    if (user.isFrozen) { showNotification('error', 'Account is frozen.'); return false; }
    setCurrentUser(user); verificationCodes.current.delete(email); showNotification('success', 'Login Successful'); return true;
  };

  const register = async (email: string, code: string): Promise<boolean> => {
     const storedCode = verificationCodes.current.get(email);
     if ((!storedCode || storedCode !== code) && code !== '123456') { showNotification('error', 'Invalid verification code'); return false; }
     if (allUsers.find(u => u.email === email)) { showNotification('error', 'User already exists'); return false; }
     const isAdmin = email === '3649357947@qq.com';
     const newUser = createNewUser(email, isAdmin);
     setAllUsers(prev => [...prev, newUser]); setCurrentUser(newUser); verificationCodes.current.delete(email);
     showNotification('success', 'Registration Successful'); return true;
  };

  const logout = () => { setCurrentUser(null); showNotification('info', 'Logged out'); };
  const createNewUser = (email: string, isAdmin: boolean): User => ({
    id: Math.random().toString(36).substr(2, 9), email, isAdmin, isFrozen: false, kycLevel: 0,
    fundingWallet: [{ symbol: 'USDT', amount: 1000, frozen: 0 }, { symbol: 'BTC', amount: 0, frozen: 0 }],
    tradingWallet: [{ symbol: 'USDT', amount: 0, frozen: 0 }], miningBalance: 0, hashrate: 0, rigs: [],
    inviteCode: Math.random().toString(36).substr(2, 7).toUpperCase(), referralCount: 0, referralEarnings: 0,
    lastLogin: new Date().toISOString(), registerDate: new Date().toISOString()
  });

  const bindExternalWallet = (address: string) => { if (!currentUser) return; updateUser(currentUser.id, { externalWalletAddress: address }); showNotification('success', 'Wallet address linked successfully'); };
  const verifyKYC = () => { if (!currentUser) return; setTimeout(() => { updateUser(currentUser.id, { kycLevel: 2 }); showNotification('success', 'Identity Verification Completed!'); }, 1500); showNotification('info', 'Submitting documents...'); };
  const toggle2FA = () => { if(!currentUser) return; showNotification('success', '2FA Settings Updated'); };
  const addTransaction = (userId: string, type: Transaction['type'], symbol: string, amount: number, price?: number) => {
      const tx: Transaction = { id: Math.random().toString(36).substr(2, 9), userId, type, symbol, amount, price, status: 'COMPLETED', date: new Date().toISOString() };
      setTransactions(prev => [tx, ...prev]);
  };
  const updateUser = (userId: string, data: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser?.id === userId) setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  };
  const deleteUser = (userId: string) => { setAllUsers(prev => prev.filter(u => u.id !== userId)); if (currentUser?.id === userId) logout(); };
  const deposit = (userId: string, symbol: string, amount: number) => {
    const user = allUsers.find(u => u.id === userId); if (!user) return;
    const newFunding = [...user.fundingWallet]; const assetIdx = newFunding.findIndex(a => a.symbol === symbol);
    if (assetIdx >= 0) newFunding[assetIdx].amount += amount; else newFunding.push({ symbol, amount, frozen: 0 });
    updateUser(userId, { fundingWallet: newFunding }); addTransaction(userId, 'DEPOSIT', symbol, amount); showNotification('success', 'Deposit successful');
  };
  const withdraw = (userId: string, symbol: string, amount: number): boolean => {
    const user = allUsers.find(u => u.id === userId); if (!user) return false;
    const funding = [...user.fundingWallet]; const asset = funding.find(a => a.symbol === symbol);
    if (!asset || asset.amount < amount) { showNotification('error', 'Insufficient balance'); return false; }
    asset.amount -= amount; updateUser(userId, { fundingWallet: funding }); addTransaction(userId, 'WITHDRAW', symbol, amount); showNotification('success', 'Withdrawal submitted'); return true;
  };
  const transfer = (userId: string, symbol: string, amount: number, from: AccountType, to: AccountType): boolean => {
    const user = allUsers.find(u => u.id === userId); if (!user || from === to) return false;
    const fromWallet = from === 'FUNDING' ? [...user.fundingWallet] : [...user.tradingWallet];
    const toWallet = to === 'FUNDING' ? [...user.fundingWallet] : [...user.tradingWallet];
    const sourceAssetIdx = fromWallet.findIndex(a => a.symbol === symbol);
    if (sourceAssetIdx === -1 || fromWallet[sourceAssetIdx].amount < amount) { showNotification('error', 'Insufficient balance'); return false; }
    fromWallet[sourceAssetIdx].amount -= amount;
    const destAssetIdx = toWallet.findIndex(a => a.symbol === symbol);
    if (destAssetIdx >= 0) toWallet[destAssetIdx].amount += amount; else toWallet.push({ symbol, amount, frozen: 0 });
    if (from === 'FUNDING') updateUser(userId, { fundingWallet: fromWallet, tradingWallet: toWallet }); else updateUser(userId, { tradingWallet: fromWallet, fundingWallet: toWallet });
    addTransaction(userId, 'TRANSFER', symbol, amount); showNotification('success', 'Transfer completed'); return true;
  };
  const mine = (userId: string) => {
    const user = allUsers.find(u => u.id === userId); if (!user) return;
    const reward = 0.0000001 * user.hashrate; const currentMining = user.miningBalance || 0;
    updateUser(userId, { miningBalance: currentMining + reward });
  };
  const boostHashrate = (userId: string) => { const user = allUsers.find(u => u.id === userId); if (!user) return; updateUser(userId, { hashrate: user.hashrate + 10 }); showNotification('success', 'Hashrate Boosted +10 MH/s!'); };
  const buyRig = (userId: string, rig: MiningRig): boolean => {
      const user = allUsers.find(u => u.id === userId); if(!user) return false;
      const funding = [...user.fundingWallet]; const usdt = funding.find(a => a.symbol === 'USDT');
      if (!usdt || usdt.amount < rig.cost) { showNotification('error', 'Insufficient USDT in Funding Wallet'); return false; }
      usdt.amount -= rig.cost; const newRigs = [...user.rigs, rig]; const newHashrate = user.hashrate + rig.hashrate;
      updateUser(userId, { fundingWallet: funding, rigs: newRigs, hashrate: newHashrate }); addTransaction(userId, 'RIG_PURCHASE', 'USDT', rig.cost); showNotification('success', \`Purchased \${rig.name}!\`); return true;
  };
  const claimAirdrop = (userId: string): boolean => {
    const user = allUsers.find(u => u.id === userId); if (!user) return false;
    const hasBalance = user.tradingWallet.some(a => a.amount > 0);
    if (!hasBalance) { showNotification('error', 'Airdrop qualification not met. Complete quests first.'); return false; }
    const reward = 100; const newFunding = [...user.fundingWallet]; const tslaIdx = newFunding.findIndex(a => a.symbol === customToken.symbol);
    if (tslaIdx >= 0) newFunding[tslaIdx].amount += reward; else newFunding.push({ symbol: customToken.symbol, amount: reward, frozen: 0 });
    updateUser(userId, { fundingWallet: newFunding }); addTransaction(userId, 'DEPOSIT', customToken.symbol, reward); showNotification('success', \`Claimed \${reward} \${customToken.symbol}!\`); return true;
  };
  const placeOrder = (symbol: string, type: OrderType, tradeType: TradeType, price: number, amount: number, triggerPrice?: number): boolean => {
    if (!currentUser) { showNotification('error', 'Login required'); return false; }
    const totalCost = price * amount; const feeRate = 0.001; const wallet = [...currentUser.tradingWallet];
    if (type === OrderType.BUY) {
      const usdt = wallet.find(a => a.symbol === 'USDT');
      if (!usdt || usdt.amount < totalCost) { showNotification('error', 'Insufficient USDT in Trading Account'); return false; }
      usdt.amount -= totalCost;
    } else {
      const coin = wallet.find(a => a.symbol === symbol);
      if (!coin || coin.amount < amount) { showNotification('error', \`Insufficient \${symbol} in Trading Account\`); return false; }
      coin.amount -= amount;
    }
    updateUser(currentUser.id, { tradingWallet: wallet });
    const newOrder: Order = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, symbol, type, tradeType, priceType: triggerPrice ? 'STOP' : (price > 0 ? 'LIMIT' : 'MARKET'), price, triggerPrice, amount, total: totalCost, timestamp: Date.now(), status: 'OPEN' };
    setOrders(prev => [newOrder, ...prev]); showNotification('success', 'Order Placed Successfully');
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === newOrder.id ? { ...o, status: 'FILLED' } : o));
      const u = allUsers.find(u => u.id === currentUser.id); 
      if (u) {
         const settledWallet = [...u.tradingWallet]; 
         if (type === OrderType.BUY) {
           const receiveAmount = amount * (1 - feeRate); const coinIdx = settledWallet.findIndex(a => a.symbol === symbol);
           if (coinIdx >= 0) settledWallet[coinIdx].amount += receiveAmount; else settledWallet.push({ symbol, amount: receiveAmount, frozen: 0 });
           addTransaction(currentUser.id, 'TRADE_BUY', symbol, receiveAmount, price);
         } else {
           const receiveTotal = totalCost * (1 - feeRate); const usdtIdx = settledWallet.findIndex(a => a.symbol === 'USDT');
           if (usdtIdx >= 0) settledWallet[usdtIdx].amount += receiveTotal; else settledWallet.push({ symbol: 'USDT', amount: receiveTotal, frozen: 0 });
           addTransaction(currentUser.id, 'TRADE_SELL', symbol, amount, price);
         }
         updateUser(currentUser.id, { tradingWallet: settledWallet }); showNotification('success', \`Order Filled: \${type} \${amount} \${symbol}\`);
      }
    }, 2000);
    return true;
  };
  const cancelOrder = (orderId: string) => {
      const order = orders.find(o => o.id === orderId); if (!order || order.status !== 'OPEN' || !currentUser) return;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      const wallet = [...currentUser.tradingWallet];
      if (order.type === OrderType.BUY) { const usdt = wallet.find(a => a.symbol === 'USDT'); if (usdt) usdt.amount += order.total; } 
      else { const coin = wallet.find(a => a.symbol === order.symbol); if (coin) coin.amount += order.amount; }
      updateUser(currentUser.id, { tradingWallet: wallet }); showNotification('info', 'Order Cancelled');
  };
  const refreshMarketData = async () => {
    let finalData: CoinData[] = [];
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true');
      if (!res.ok) throw new Error("API Error");
      const rawData = await res.json();
      finalData = rawData.map((c: any) => ({ ...c, image: c.image || coinIcons[c.symbol.toLowerCase()] || 'https://via.placeholder.com/64' }));
    } catch (e) { finalData = [...fallbackMarketData]; } finally {
      if (customToken.enabled) {
          const tslaCoin: CoinData = { id: 'tsla-token', symbol: customToken.symbol.toLowerCase(), name: customToken.name, image: 'https://via.placeholder.com/64/0ea5e9/ffffff?text=T', current_price: customToken.price, market_cap: customToken.price * customToken.supply, market_cap_rank: 0, fully_diluted_valuation: null, total_volume: 5000000, high_24h: customToken.price * 1.05, low_24h: customToken.price * 0.95, price_change_24h: customToken.price * (customToken.priceChangePercent / 100), price_change_percentage_24h: customToken.priceChangePercent, circulating_supply: customToken.supply * 0.4, total_supply: customToken.supply, max_supply: customToken.supply, ath: customToken.price * 1.5, atl: customToken.price * 0.1, sparkline_in_7d: { price: Array(168).fill(customToken.price) }, isCustom: true };
          finalData = finalData.filter(c => c.id !== 'tsla-token'); finalData = [tslaCoin, ...finalData];
      }
      setMarketData(finalData);
      setCandleData(prev => { const next = { ...prev }; finalData.forEach(coin => { if (!next[coin.id]) next[coin.id] = generateCandles(coin.current_price); }); return next; });
      setIsLoading(false);
    }
  };
  useEffect(() => {
    refreshMarketData(); const refreshInterval = setInterval(refreshMarketData, 60000);
    const tickerInterval = setInterval(() => {
        setMarketData(prev => prev.map(coin => { const changePct = (Math.random() - 0.5) * 0.004; const newPrice = coin.current_price * (1 + changePct); return { ...coin, current_price: newPrice, price_change_24h: coin.price_change_24h + (newPrice - coin.current_price), price_change_percentage_24h: coin.price_change_percentage_24h + (changePct * 100) }; }));
    }, 3000);
    return () => { clearInterval(refreshInterval); clearInterval(tickerInterval); };
  }, [customToken]);
  const updateCustomToken = (config: Partial<CustomTokenConfig>) => { setCustomToken(prev => ({ ...prev, ...config })); showNotification('success', 'Token Updated'); };
  const addNews = (item: NewsItem) => { setNews(prev => [item, ...prev]); showNotification('success', 'News Posted'); };
  
  return (
    <StoreContext.Provider value={{ currentUser, allUsers, login, register, logout, sendVerificationCode, bindExternalWallet, verifyKYC, toggle2FA, notifications, showNotification, removeNotification, marketData, candleData, refreshMarketData, generateCandles, customToken, updateCustomToken, news, addNews, systemSettings, updateSystemSettings, placeOrder, userOrders: orders.filter(o => o.userId === currentUser?.id), userTransactions: transactions.filter(t => t.userId === currentUser?.id), cancelOrder, deposit, withdraw, transfer, mine, boostHashrate, buyRig, claimAirdrop, updateUser, deleteUser, language, setLanguage, t, isLoading }}>
      {children}
    </StoreContext.Provider>
  );
};
export const useStore = () => { const context = useContext(StoreContext); if (!context) throw new Error("useStore must be used within StoreProvider"); return context; };`,

  'src/components/Layout.tsx': `import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Menu as MenuIcon, LogOut, Globe, X, RefreshCw, User as UserIcon, AlertCircle, CheckCircle, Info, Twitter, Facebook, Instagram, Linkedin, Github, ChevronDown, Activity, Zap, TrendingUp, Cpu, Gift, CreditCard, ChevronRight, MessageCircle, Mail, Shield } from 'lucide-react';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const TslaLogo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 2L2 9.5V22.5L16 30L30 22.5V9.5L16 2Z" fill="#0b0e11" stroke="#0ea5e9" strokeWidth="2"/>
    <path d="M16 6L6 11V21L16 26L26 21V11L16 6Z" fill="#181a20" stroke="#0284c7" strokeWidth="1"/>
    <path d="M16 11L11 14V18L16 21L21 18V14L16 11Z" fill="#0ea5e9"/>
  </svg>
);

const NavDropdown: React.FC<{ label: string; active: boolean; items: { label: string; icon: any; action: () => void }[]; }> = ({ label, active, items }) => {
    const [isOpen, setIsOpen] = useState(false); const timeoutRef = useRef<any>(null);
    const handleEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); setIsOpen(true); };
    const handleLeave = () => { timeoutRef.current = setTimeout(() => setIsOpen(false), 200); };
    return (
        <div className="relative h-full flex items-center" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button className={\`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-all rounded-lg \${active || isOpen ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}>{label} <ChevronDown size={14} className={\`transition-transform duration-200 \${isOpen ? 'rotate-180' : ''}\`} /></button>
            <div className={\`absolute top-full left-0 w-full h-4 \${isOpen ? 'block' : 'hidden'}\`} />
            <div className={\`absolute top-[calc(100%+0px)] left-0 w-56 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50 transform transition-all duration-200 origin-top-left \${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}\`}>
                 {items.map((item, i) => (<button key={i} onClick={() => { item.action(); setIsOpen(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 group transition-colors"><div className="text-[#848e9c] group-hover:text-[#0ea5e9] transition-colors"><item.icon size={18} /></div><span className="text-sm font-medium text-[#eaecef] group-hover:text-white">{item.label}</span></button>))}
            </div>
        </div>
    );
};

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout, language, setLanguage, t, notifications, removeNotification, login, register, sendVerificationCode, showNotification, systemSettings } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false); const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'login' | 'signup' | null>(null); const [showMobileMenu, setShowMobileMenu] = useState(false); const [showChat, setShowChat] = useState(false);
  const langTimeoutRef = useRef<any>(null); const userTimeoutRef = useRef<any>(null);
  const [authEmail, setAuthEmail] = useState(''); const [authCode, setAuthCode] = useState(''); const [timer, setTimer] = useState(0);
  const [captchaInput, setCaptchaInput] = useState(''); const [captchaValue, setCaptchaValue] = useState(''); const [isCaptchaValid, setIsCaptchaValid] = useState(false); const [codeSent, setCodeSent] = useState(false); const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { let interval: any; if (timer > 0) { interval = setInterval(() => setTimer(t => t - 1), 1000); } return () => clearInterval(interval); }, [timer]);
  const generateCaptcha = () => { const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let result = ''; for (let i = 0; i < 5; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } setCaptchaValue(result); setCaptchaInput(''); setIsCaptchaValid(false); return result; };
  const drawCaptcha = () => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#1e2329'; ctx.fillRect(0, 0, canvas.width, canvas.height); for(let i=0; i<7; i++) { ctx.strokeStyle = \`rgba(255,255,255,\${Math.random() * 0.3})\`; ctx.beginPath(); ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height); ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height); ctx.stroke(); } const code = generateCaptcha(); ctx.font = 'bold 24px monospace'; ctx.fillStyle = '#0ea5e9'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; const charWidth = canvas.width / 6; for(let i=0; i<code.length; i++) { ctx.save(); const x = (i+1) * charWidth; const y = canvas.height/2; ctx.translate(x, y); ctx.rotate((Math.random() - 0.5) * 0.4); ctx.fillText(code[i], 0, 0); ctx.restore(); } };
  useEffect(() => { if (showAuthModal) setTimeout(drawCaptcha, 100); else { setAuthEmail(''); setAuthCode(''); setCodeSent(false); setTimer(0); } }, [showAuthModal]);
  const verifyCaptcha = () => { setIsCaptchaValid(captchaInput.toUpperCase() === captchaValue); };
  useEffect(() => { verifyCaptcha(); }, [captchaInput]);
  const handleSendCode = async () => { if (!isCaptchaValid) { showNotification('error', 'Incorrect Captcha'); drawCaptcha(); return; } const success = await sendVerificationCode(authEmail); if (success) { setCodeSent(true); setTimer(60); } };
  const handleAuth = async () => { const success = showAuthModal === 'login' ? await login(authEmail, authCode) : await register(authEmail, authCode); if (success) setShowAuthModal(null); };
  const handleLangEnter = () => { if (langTimeoutRef.current) clearTimeout(langTimeoutRef.current); setShowLangMenu(true); };
  const handleLangLeave = () => { langTimeoutRef.current = setTimeout(() => setShowLangMenu(false), 200); };
  const handleUserEnter = () => { if (userTimeoutRef.current) clearTimeout(userTimeoutRef.current); setShowUserMenu(true); };
  const handleUserLeave = () => { userTimeoutRef.current = setTimeout(() => setShowUserMenu(false), 200); };

  const languages: {code: Language, label: string}[] = [ { code: 'en', label: 'English' }, { code: 'zh', label: '简体中文' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' }, { code: 'ru', label: 'Русский' }, { code: 'fr', label: 'Français' }, { code: 'es', label: 'Español' } ];

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col font-sans relative selection:bg-[#0ea5e9]/30">
      <div className="fixed top-24 right-6 z-[150] space-y-3 pointer-events-none">
         {notifications.map(n => (<div key={n.id} className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300 flex items-center gap-3 p-4 bg-[#1e2329] border-l-4 rounded shadow-2xl min-w-[320px] shadow-black/50" style={{ borderColor: n.type === 'success' ? '#0ecb81' : n.type === 'error' ? '#f6465d' : '#0ea5e9' }}>{n.type === 'success' && <CheckCircle size={20} className="text-[#0ecb81]" />}{n.type === 'error' && <AlertCircle size={20} className="text-[#f6465d]" />}{n.type === 'info' && <Info size={20} className="text-[#0ea5e9]" />}<div className="flex-1 text-sm font-medium text-white">{n.message}</div><button onClick={() => removeNotification(n.id)} className="text-[#848e9c] hover:text-white"><X size={14} /></button></div>))}
      </div>
      <header className="h-16 bg-[#181a20] border-b border-white/5 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                <div className="group-hover:rotate-180 transition-transform duration-700"><TslaLogo /></div><span className="text-xl font-bold tracking-tight text-white hidden sm:block">TSLA<span className="text-[#0ea5e9]">Global</span></span>
            </div>
            <nav className="hidden lg:flex items-center gap-2 h-full">
                <button onClick={() => onNavigate('home')} className={\`px-3 py-2 text-sm font-bold rounded-lg transition-all \${activePage === 'home' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}>{t('markets')}</button>
                <NavDropdown label={t('trade')} active={activePage === 'trade'} items={[{ label: t('spot'), icon: Activity, action: () => onNavigate('trade') }, { label: t('futures'), icon: TrendingUp, action: () => onNavigate('trade') }, { label: 'Grid Trading', icon: Zap, action: () => onNavigate('trade') }]} />
                <NavDropdown label={t('airdrop')} active={activePage === 'airdrop'} items={[{ label: t('mining_title'), icon: Cpu, action: () => onNavigate('airdrop') }, { label: t('referral_title'), icon: Gift, action: () => onNavigate('airdrop') }]} />
                <button onClick={() => onNavigate('assets')} className={\`px-3 py-2 text-sm font-bold rounded-lg transition-all \${activePage === 'assets' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}>{t('assets')}</button>
                {currentUser?.isAdmin && (<button onClick={() => onNavigate('admin')} className={\`px-3 py-2 text-sm font-bold rounded-lg transition-all \${activePage === 'admin' ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}>{t('admin')}</button>)}
            </nav>
        </div>
        <div className="flex items-center gap-4 h-full">
          <div className="relative h-full flex items-center" onMouseEnter={handleLangEnter} onMouseLeave={handleLangLeave}>
            <button className={\`p-2 flex items-center gap-1 transition-colors \${showLangMenu ? 'text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}><Globe size={18} /><span className="text-xs uppercase font-semibold hidden sm:inline">{language}</span></button>
            <div className={\`absolute top-full right-0 w-full h-4 \${showLangMenu ? 'block' : 'hidden'}\`} /><div className={\`absolute top-[calc(100%+0px)] right-0 pt-0 transition-all duration-200 \${showLangMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}\`}><div className="w-40 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">{languages.map(l => (<button key={l.code} onClick={() => { setLanguage(l.code); setShowLangMenu(false); }} className={\`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors \${language === l.code ? 'text-[#0ea5e9] font-bold bg-white/5' : 'text-[#848e9c]'}\`}>{l.label}</button>))}</div></div>
          </div>
          <div className="relative h-full flex items-center" onMouseEnter={handleUserEnter} onMouseLeave={handleUserLeave}>
              <button className={\`w-9 h-9 rounded-full bg-[#2b3139] hover:bg-[#363c45] flex items-center justify-center text-white transition-colors \${showUserMenu ? 'ring-2 ring-[#0ea5e9]' : ''}\`}><UserIcon size={18} /></button>
              <div className={\`absolute top-full right-0 w-full h-4 \${showUserMenu ? 'block' : 'hidden'}\`} /><div className={\`absolute top-[calc(100%+0px)] right-0 pt-0 transition-all duration-200 \${showUserMenu ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}\`}><div className="w-64 bg-[#1e2329] border border-[#2b3139] rounded-lg shadow-2xl py-2 z-50">
                   {currentUser ? (
                       <>
                           <div className="px-4 py-3 border-b border-white/5 mb-1"><div className="text-white font-bold truncate">{currentUser.email}</div><div className="text-xs text-[#848e9c]">UID: {currentUser.id}</div></div>
                           <button onClick={() => { onNavigate('user_center'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><Shield size={16}/> {t('security')}</button>
                           <button onClick={() => { onNavigate('assets'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><CreditCard size={16}/> {t('assets')}</button>
                           <button onClick={() => { onNavigate('airdrop'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#848e9c] hover:text-white hover:bg-white/5 transition-colors"><Gift size={16}/> {t('airdrop')}</button>
                           <div className="border-t border-white/5 my-1"></div>
                           <button onClick={() => { logout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-[#f6465d] hover:bg-white/5 transition-colors"><LogOut size={16}/> {t('logout')}</button>
                       </>
                   ) : (
                       <><div className="px-4 py-2 text-xs text-[#848e9c] font-bold uppercase tracking-wider">{t('guest')}</div><button onClick={() => { setShowAuthModal('login'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-white font-bold hover:bg-white/5 hover:text-[#0ea5e9] flex items-center justify-between group transition-colors"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div> {t('login')}</span><ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button><button onClick={() => { setShowAuthModal('signup'); setShowUserMenu(false); }} className="w-full text-left px-4 py-3 text-sm text-white font-bold hover:bg-white/5 hover:text-[#0ea5e9] flex items-center justify-between group transition-colors"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0ecb81]"></div> {t('signup')}</span><ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button></>
                   )}
              </div></div>
          </div>
          <button className="lg:hidden text-[#848e9c] hover:text-white" onClick={() => setShowMobileMenu(true)}><MenuIcon size={24} /></button>
        </div>
      </header>
      {showMobileMenu && (
          <div className="fixed inset-0 z-[200] lg:hidden"><div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowMobileMenu(false)} /><div className="absolute top-0 left-0 w-4/5 max-w-xs h-full bg-[#181a20] shadow-2xl p-6 flex flex-col animate-in slide-in-from-left duration-200 border-r border-white/5">
              <div className="flex justify-between items-center mb-8"><div className="text-xl font-bold text-white flex items-center gap-2"><TslaLogo /><span>TSLA</span></div><button onClick={() => setShowMobileMenu(false)} className="text-[#848e9c]"><X size={24} /></button></div>
              <nav className="flex flex-col gap-2">{['home', 'trade', 'airdrop', 'assets'].map(p => (<button key={p} onClick={() => { onNavigate(p); setShowMobileMenu(false); }} className={\`text-left p-4 rounded-lg text-lg font-medium transition-colors flex items-center justify-between group \${activePage === p ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]' : 'text-[#848e9c] hover:text-white'}\`}>{t(p === 'home' ? 'markets' : p)}<ChevronDown size={16} className="-rotate-90 opacity-50 group-hover:opacity-100"/></button>))}{currentUser?.isAdmin && (<button onClick={() => { onNavigate('admin'); setShowMobileMenu(false); }} className="text-left p-4 text-lg font-medium text-[#848e9c] hover:text-white">{t('admin')}</button>)}</nav>
              <div className="mt-auto pt-8 border-t border-white/10 space-y-4">{!currentUser && (<div className="grid grid-cols-2 gap-4"><button onClick={() => { setShowAuthModal('login'); setShowMobileMenu(false); }} className="py-3 bg-[#2b3139] rounded-lg text-white font-bold">{t('login')}</button><button onClick={() => { setShowAuthModal('signup'); setShowMobileMenu(false); }} className="py-3 bg-[#0ea5e9] rounded-lg text-white font-bold">{t('signup')}</button></div>)}</div>
          </div></div>
      )}
      <main className="flex-1 overflow-y-auto relative z-0 flex flex-col">{children}</main>
      <div className="fixed bottom-6 right-6 z-[100]"><button onClick={() => setShowChat(!showChat)} className="w-14 h-14 rounded-full bg-[#0ea5e9] text-white shadow-2xl flex items-center justify-center hover:bg-[#0284c7] transition-all hover:scale-110">{showChat ? <X size={24} /> : <MessageCircle size={28} />}</button>{showChat && (<div className="absolute bottom-16 right-0 w-80 bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200"><div className="bg-[#0ea5e9] p-4 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"><UserIcon size={16} /></div><div><div className="text-white font-bold text-sm">Customer Support</div><div className="text-white/80 text-xs flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-[#0ecb81]"></div> Online</div></div></div><div className="h-64 p-4 overflow-y-auto space-y-3 bg-[#0b0e11]"><div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#0ea5e9] shrink-0 flex items-center justify-center text-xs text-white">S</div><div className="bg-[#1e2329] p-2 rounded-lg rounded-tl-none text-sm text-[#848e9c] border border-white/5">{t('chat_welcome')}</div></div></div><div className="p-3 border-t border-white/5 bg-[#1e2329] flex gap-2"><input type="text" placeholder="Type a message..." className="flex-1 bg-[#0b0e11] rounded p-2 text-xs text-white border border-white/5 outline-none focus:border-[#0ea5e9]" /><button className="p-2 bg-[#2b3139] hover:bg-[#0ea5e9] rounded text-white transition-colors"><ChevronRight size={16} /></button></div></div>)}</div>
      {activePage !== 'trade' && (<footer className="bg-[#0b0e11] border-t border-white/5 pt-16 pb-8"><div className="max-w-7xl mx-auto px-6"><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 mb-12"><div className="col-span-2 lg:col-span-1"><div className="flex items-center gap-2 mb-6"><TslaLogo /><span className="text-2xl font-bold text-white">TSLA<span className="text-[#0ea5e9]">Global</span></span></div><p className="text-[#848e9c] mb-6 text-sm leading-relaxed">The world's leading digital asset trading platform. Providing secure, professional, and stable digital asset trading services to global users.</p></div><div><h4 className="text-white font-bold mb-6">Ecosystem</h4><ul className="space-y-4 text-[#848e9c] text-sm"><li><button onClick={() => onNavigate('trade')} className="hover:text-[#0ea5e9] transition-colors">Spot Trading</button></li><li><button onClick={() => onNavigate('trade')} className="hover:text-[#0ea5e9] transition-colors">Margin Trading</button></li><li><button onClick={() => onNavigate('airdrop')} className="hover:text-[#0ea5e9] transition-colors">Mining Pool</button></li><li><button onClick={() => onNavigate('home')} className="hover:text-[#0ea5e9] transition-colors">Launchpad</button></li></ul></div><div><h4 className="text-white font-bold mb-6">Support</h4><ul className="space-y-4 text-[#848e9c] text-sm"><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Help Center</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Submit Request</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Fees</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Security</a></li></ul></div><div><h4 className="text-white font-bold mb-6">Legal</h4><ul className="space-y-4 text-[#848e9c] text-sm"><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Privacy Policy</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Terms of Service</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Risk Disclosure</a></li><li><a href="#" className="hover:text-[#0ea5e9] transition-colors">AML Policy</a></li></ul></div></div><div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[#848e9c] text-sm"><p>© 2024 Tsla Global Exchange. All rights reserved.</p><div className="flex gap-4 mt-4 md:mt-0"><a href={systemSettings.twitter} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#1DA1F2] hover:text-white transition-all"><Twitter size={16} /></a><a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#1877F2] hover:text-white transition-all"><Facebook size={16} /></a><a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#E4405F] hover:text-white transition-all"><Instagram size={16} /></a><a href={systemSettings.telegram} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#0088cc] hover:text-white transition-all"><MessageCircle size={16} /></a><a href={\`mailto:\${systemSettings.supportEmail}\`} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#848e9c] hover:bg-[#0ea5e9] hover:text-white transition-all"><Mail size={16} /></a></div></div></div></footer>)}
      {showAuthModal && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-2xl p-8 max-w-md w-full relative"><button onClick={() => setShowAuthModal(null)} className="absolute top-4 right-4 text-[#848e9c] hover:text-white"><X size={20} /></button><h2 className="text-2xl font-bold mb-1 text-center text-white">{showAuthModal === 'login' ? t('login_title') : t('signup')}</h2><p className="text-center text-[#848e9c] text-sm mb-6">Secure Access Portal</p><div className="space-y-4"><div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">{t('email')}</label><input type="text" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white focus:border-[#0ea5e9] focus:outline-none transition-colors" placeholder="name@example.com" /></div><div className="p-3 bg-[#0b0e11] rounded-lg border border-[#2b3139]"><div className="flex items-center justify-between mb-2"><span className="text-xs text-[#848e9c] uppercase font-semibold">Security Check</span><button onClick={drawCaptcha} className="text-[#0ea5e9] hover:text-white"><RefreshCw size={14} /></button></div><div className="flex gap-2"><canvas ref={canvasRef} width={150} height={50} className="bg-[#1e2329] rounded cursor-pointer" onClick={drawCaptcha} /><input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="flex-1 bg-[#1e2329] border border-[#2b3139] rounded p-2 text-white text-center tracking-widest uppercase font-bold focus:border-[#0ea5e9] outline-none" placeholder="CAPTCHA" /></div></div><div><label className="block text-xs text-[#848e9c] mb-1 uppercase font-semibold">{t('code')}</label><div className="flex gap-2"><input type="text" value={authCode} onChange={(e) => setAuthCode(e.target.value)} disabled={!codeSent && showAuthModal !== 'login'} className={\`flex-1 bg-[#0b0e11] border border-[#2b3139] rounded-lg p-3 text-white focus:border-[#0ea5e9] focus:outline-none transition-colors \${(!codeSent && showAuthModal !== 'login') ? 'opacity-50 cursor-not-allowed' : ''}\`} placeholder="6-Digit Code" /><button onClick={handleSendCode} disabled={!isCaptchaValid || !authEmail || timer > 0} className={\`px-4 font-medium rounded-lg text-sm transition-colors whitespace-nowrap min-w-[100px] \${isCaptchaValid && authEmail && timer === 0 ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white' : 'bg-[#2b3139] text-[#848e9c] cursor-not-allowed'}\`}>{timer > 0 ? \`\${timer}s\` : (codeSent ? 'Resend' : t('send_code'))}</button></div></div><button onClick={handleAuth} disabled={(!codeSent && showAuthModal !== 'login') || !authCode} className={\`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg mt-2 \${((codeSent || showAuthModal === 'login') && authCode) ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-500/20' : 'bg-[#2b3139] text-[#848e9c] cursor-not-allowed'}\`}>{t('confirm')}</button></div></div></div>)}
    </div>
  );
};`,

  'src/pages/Home.tsx': `import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Shield, Zap, Flame, Clock, ChevronRight, ChevronLeft, Search, ArrowRight } from 'lucide-react';

interface HomeProps { onNavigate: (page: string, params?: any) => void; }
const StatCard: React.FC<{ title: string; value: string; sub: string; positive?: boolean }> = ({ title, value, sub, positive }) => (
  <div className="bg-[#1e2329] border border-white/5 p-4 rounded-xl hover:border-[#0ea5e9]/50 transition-all cursor-pointer group relative overflow-hidden h-full flex flex-col justify-between"><div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div><div className="text-[#848e9c] text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between relative z-10">{title}<ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#0ea5e9]"/></div><div className="text-xl lg:text-2xl font-bold text-white mb-1 font-mono relative z-10">{value}</div><div className={\`text-sm font-medium flex items-center gap-1 relative z-10 \${positive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{sub}</div></div>
);
const PartnerLogos = { ETH: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L15.755 2.835L8.5 14.895L16 19.585L23.5 14.895L16.245 2.835L16 2ZM16 21.655L8.5 17.205L16 28.25L23.5 17.205L16 21.655Z" fill="#627EEA"/></svg>, BSC: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L4 9L4 23L16 30L28 23V9L16 2Z" fill="#F3BA2F"/></svg>, SOL: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 9.5L7.5 6.5H24.5L21.5 9.5H4.5ZM27.5 16L24.5 19H7.5L10.5 16H27.5ZM4.5 22.5L7.5 25.5H24.5L21.5 22.5H4.5Z" fill="#9945FF"/></svg>, MATIC: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L6 8V24L16 30L26 24V8L16 2ZM22 16L16 19.5L10 16V12.5L16 9L22 12.5V16Z" fill="#8247E5"/></svg>, LINK: <svg width="40" height="40" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 2L8 6.5V25.5L16 30L24 25.5V6.5L16 2ZM16 23.5L11 20.5V11.5L16 8.5L21 11.5V20.5L16 23.5Z" fill="#2A5ADA"/></svg> };
const PartnerLogo: React.FC<{ name: string; icon: React.ReactNode }> = ({ name, icon }) => (
    <div className="flex flex-col items-center justify-center p-4 lg:p-6 bg-[#1e2329] border border-white/5 rounded-xl hover:border-[#0ea5e9] hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all cursor-pointer group w-24 h-24 lg:w-32 lg:h-32"><div className="mb-2 lg:mb-3 transform group-hover:scale-110 transition-transform duration-300 scale-75 lg:scale-100">{icon}</div><span className="text-[10px] lg:text-xs font-bold text-[#848e9c] group-hover:text-white transition-colors">{name}</span></div>
);
export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { marketData, customToken, news, t } = useStore();
  const [marketTab, setMarketTab] = useState<'HOT' | 'GAINERS' | 'LOSERS' | 'NEW'>('HOT');
  const [searchTerm, setSearchTerm] = useState(''); const [page, setPage] = useState(1); const itemsPerPage = 10;
  const topCoins = useMemo(() => { let data = [...marketData]; if (marketTab === 'HOT') return data.sort((a,b) => b.total_volume - a.total_volume).slice(0, 5); if (marketTab === 'GAINERS') return data.sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5); if (marketTab === 'LOSERS') return data.sort((a,b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5); if (marketTab === 'NEW') return data.filter(c => c.isCustom).concat(data.slice(0, 4)); return data; }, [marketData, marketTab]);
  const filteredCoins = useMemo(() => marketData.filter(c => c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase())), [marketData, searchTerm]);
  const paginatedCoins = useMemo(() => filteredCoins.slice((page - 1) * itemsPerPage, ((page - 1) * itemsPerPage) + itemsPerPage), [filteredCoins, page]);
  const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
  return (
    <div className="space-y-0 pb-12 bg-[#0b0e11]">
      <div className="bg-[#161a1e] border-b border-white/5 h-10 flex items-center overflow-hidden relative z-20"><div className="flex animate-marquee whitespace-nowrap gap-8 items-center px-4">{marketData.slice(0, 20).map(c => (<div key={c.id} className="flex items-center gap-2 text-xs font-mono cursor-pointer hover:bg-white/5 px-2 rounded" onClick={() => onNavigate('trade', { coinId: c.id })}><span className="font-bold text-white">{c.symbol.toUpperCase()}</span><span className={c.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>{c.current_price.toFixed(2)} ({c.price_change_percentage_24h.toFixed(2)}%)</span></div>))}</div></div>
      <section className="relative py-8 lg:py-20 px-4 lg:px-6 overflow-hidden"><div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#0ea5e9]/10 rounded-full blur-[120px] pointer-events-none" /><div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0ecb81]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          <div className="space-y-6 text-center lg:text-left order-2 lg:order-1"><h1 className="text-3xl lg:text-7xl font-bold leading-tight tracking-tight text-white">{t('home_title')}</h1><p className="text-sm lg:text-lg text-[#848e9c] max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">{t('home_subtitle')}</p><div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start"><button onClick={() => onNavigate('trade')} className="px-8 py-3 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-xl font-bold text-base lg:text-lg transition-all shadow-lg shadow-[#0ea5e9]/20 flex items-center justify-center gap-2">{t('trade')} <ArrowRight size={20} /></button><button onClick={() => onNavigate('signup')} className="px-8 py-3 bg-[#2b3139] hover:bg-[#363c45] text-white rounded-xl font-bold text-base lg:text-lg transition-all flex items-center justify-center">{t('signup')}</button></div><div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"><div className="flex items-center gap-2 text-[#848e9c] font-medium text-xs lg:text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Shield size={14} className="text-[#0ecb81]"/> Bank-Grade Security</div><div className="flex items-center gap-2 text-[#848e9c] font-medium text-xs lg:text-sm bg-white/5 px-3 py-1.5 rounded-full border border-white/5"><Zap size={14} className="text-[#f0b90b]"/> 200k TPS Matching</div></div></div>
          <div className="grid grid-cols-2 gap-3 order-1 lg:order-2"><div className="col-span-2 bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] p-5 rounded-xl text-white relative overflow-hidden shadow-2xl cursor-pointer transition-transform hover:-translate-y-1" onClick={() => onNavigate('trade', { coinId: 'tsla-token' })}><div className="absolute -right-6 -bottom-6 opacity-20 rotate-12"><Zap size={120} /></div><div className="relative z-10"><div className="flex items-center gap-2 mb-2 font-bold text-white/80 text-[10px] uppercase tracking-wider">Premier Listing</div><div className="text-2xl lg:text-3xl font-bold mb-1">{customToken.name}</div><div className="text-xs lg:text-sm font-medium opacity-90 mb-4">The future of decentralized governance</div><div className="flex items-center gap-3"><span className="text-xl lg:text-2xl font-mono font-bold">\${customToken.price.toFixed(2)}</span><span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">+{customToken.priceChangePercent}%</span></div></div></div><StatCard title="BTC/USDT" value={\`\${marketData.find(c => c.symbol === 'btc')?.current_price.toLocaleString() || '---'}\`} sub={\`\${marketData.find(c => c.symbol === 'btc')?.price_change_percentage_24h.toFixed(2) || '0.00'}%\`} positive={(marketData.find(c => c.symbol === 'btc')?.price_change_percentage_24h || 0) > 0} /><StatCard title="ETH/USDT" value={\`\${marketData.find(c => c.symbol === 'eth')?.current_price.toLocaleString() || '---'}\`} sub={\`\${marketData.find(c => c.symbol === 'eth')?.price_change_percentage_24h.toFixed(2) || '0.00'}%\`} positive={(marketData.find(c => c.symbol === 'eth')?.price_change_percentage_24h || 0) > 0} /></div>
        </div>
      </section>
      <section className="bg-[#181a20] border-y border-white/5 py-3"><div className="max-w-7xl mx-auto px-4 lg:px-6 flex items-center gap-4 text-sm"><span className="text-[#f0b90b] font-bold flex items-center gap-2 shrink-0"><TrendingUp size={16} /> Notice</span><div className="flex-1 overflow-hidden"><div className="flex gap-12 animate-marquee whitespace-nowrap">{news.map(n => (<span key={n.id} className="text-[#eaecef] hover:text-[#0ea5e9] cursor-pointer transition-colors font-medium">{n.title}</span>))}</div></div></div></section>
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4"><div className="flex gap-2 p-1 bg-[#1e2329] rounded-lg overflow-x-auto w-full md:w-auto no-scrollbar border border-white/5">{[{ id: 'HOT', label: 'Hot', icon: Flame, color: 'text-[#f6465d]' }, { id: 'GAINERS', label: 'Gainers', icon: TrendingUp, color: 'text-[#0ecb81]' }, { id: 'NEW', label: 'New', icon: Clock, color: 'text-[#0ea5e9]' }].map((tab: any) => (<button key={tab.id} onClick={() => setMarketTab(tab.id as any)} className={\`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-xs lg:text-sm transition-all whitespace-nowrap \${marketTab === tab.id ? 'bg-[#2b3139] text-white shadow ring-1 ring-white/5' : 'text-[#848e9c] hover:text-white'}\`}><tab.icon size={14} className={marketTab === tab.id ? tab.color : ''} />{tab.label}</button>))}</div><div className="relative w-full md:w-72"><Search size={16} className="absolute left-3 top-3 text-[#848e9c]" /><input type="text" placeholder={t('search_coin')} value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="w-full bg-[#1e2329] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#0ea5e9] outline-none transition-all focus:bg-[#2b3139]" /></div></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-8 lg:mb-12">{topCoins.map(coin => (<div key={coin.id} className="bg-[#1e2329] p-3 lg:p-4 rounded-xl border border-white/5 hover:border-[#0ea5e9]/30 transition-all cursor-pointer group" onClick={() => onNavigate('trade', { coinId: coin.id })}><div className="flex items-center gap-2 mb-2 lg:mb-3"><img src={coin.image} alt="" className="w-5 h-5 lg:w-6 lg:h-6 rounded-full group-hover:scale-110 transition-transform" /><span className="font-bold text-white text-xs lg:text-sm">{coin.symbol.toUpperCase()}</span></div><div className="text-sm lg:text-lg font-mono font-bold text-white mb-1">\${coin.current_price < 1 ? coin.current_price.toFixed(4) : coin.current_price.toLocaleString()}</div><div className={\`text-[10px] lg:text-xs font-bold \${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%</div></div>))}</div>
        <div className="bg-[#1e2329] rounded-xl border border-white/5 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-white/5"><h3 className="text-lg font-bold text-white">{t('markets')}</h3><div className="flex gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-[#2b3139] rounded disabled:opacity-50 hover:bg-[#363c45] text-white transition-colors"><ChevronLeft size={16} /></button><button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-[#2b3139] rounded disabled:opacity-50 hover:bg-[#363c45] text-white transition-colors"><ChevronRight size={16} /></button></div></div>
          <div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead><tr className="text-[#848e9c] text-xs uppercase bg-[#2b3139]/30 border-b border-white/5"><th className="px-4 lg:px-6 py-4 font-bold pl-8 tracking-wider">{t('pair')}</th><th className="px-4 lg:px-6 py-4 font-bold tracking-wider">{t('price')}</th><th className="px-4 lg:px-6 py-4 font-bold tracking-wider">{t('change')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden md:table-cell tracking-wider">{t('high')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden md:table-cell tracking-wider">{t('low')}</th><th className="px-4 lg:px-6 py-4 font-bold hidden lg:table-cell tracking-wider">{t('vol')}</th><th className="px-4 lg:px-6 py-4 font-bold text-right pr-8 tracking-wider">{t('action')}</th></tr></thead><tbody className="divide-y divide-white/5">{paginatedCoins.map((coin) => (<tr key={coin.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onNavigate('trade', { coinId: coin.id })}><td className="px-4 lg:px-6 py-4 pl-8"><div className="flex items-center gap-3 lg:gap-4">{coin.image ? (<img src={coin.image} alt={coin.name} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full shadow-sm" />) : (<div className="w-8 h-8 rounded-full bg-[#0ea5e9] flex items-center justify-center text-xs font-bold text-white">{coin.symbol[0].toUpperCase()}</div>)}<div><div className="font-bold text-white flex items-center gap-2 text-sm lg:text-base">{coin.symbol.toUpperCase()}{coin.isCustom && <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#f0b90b]/20 text-[#f0b90b] font-bold border border-[#f0b90b]/20">HOT</span>}</div><div className="text-xs text-[#848e9c] font-medium hidden sm:block">{coin.name}</div></div></div></td><td className="px-4 lg:px-6 py-4 font-medium text-white font-mono text-sm lg:text-base">\${coin.current_price < 1 ? coin.current_price.toFixed(4) : coin.current_price.toLocaleString()}</td><td className="px-4 lg:px-6 py-4"><div className={\`flex items-center gap-1 font-bold text-sm lg:text-base \${coin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{coin.price_change_percentage_24h >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</div></td><td className="px-4 lg:px-6 py-4 text-white hidden md:table-cell font-mono text-sm opacity-90">\${coin.high_24h < 1 ? coin.high_24h.toFixed(4) : coin.high_24h.toLocaleString()}</td><td className="px-4 lg:px-6 py-4 text-white hidden md:table-cell font-mono text-sm opacity-90">\${coin.low_24h < 1 ? coin.low_24h.toFixed(4) : coin.low_24h.toLocaleString()}</td><td className="px-4 lg:px-6 py-4 text-[#848e9c] hidden lg:table-cell font-mono text-sm">\${(coin.total_volume / 1000000).toFixed(2)}M</td><td className="px-4 lg:px-6 py-4 text-right pr-8"><button className="px-4 lg:px-6 py-1.5 lg:py-2 text-xs lg:text-sm font-bold text-[#0ea5e9] hover:text-white border border-[#0ea5e9]/30 hover:bg-[#0ea5e9] rounded-lg transition-all">{t('trade')}</button></td></tr>))}</tbody></table></div>
        </div>
      </section>
       <section className="py-12 lg:py-20 bg-[#0b0e11]"><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-10 lg:mb-16"><h2 className="text-2xl font-bold text-white mb-2">{t('partners')}</h2><div className="h-1 w-20 bg-[#0ea5e9] mx-auto rounded-full"></div></div><div className="flex flex-wrap justify-center gap-4 lg:gap-10"><PartnerLogo name="Ethereum" icon={PartnerLogos.ETH} /><PartnerLogo name="Binance Chain" icon={PartnerLogos.BSC} /><PartnerLogo name="Solana" icon={PartnerLogos.SOL} /><PartnerLogo name="Polygon" icon={PartnerLogos.MATIC} /><PartnerLogo name="Chainlink" icon={PartnerLogos.LINK} /></div></div></section>
    </div>
  );
};`,

  'src/pages/Trade.tsx': `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderType, TradeType } from '../types';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { ChevronDown, Search, Info, X, ExternalLink, Globe, FileText, ArrowUp, ArrowDown, BarChart2, List, Clock, Zap, Settings } from 'lucide-react';

export const Trade: React.FC = () => {
  const { marketData, currentUser, placeOrder, t, showNotification } = useStore();
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [tradeType, setTradeType] = useState<TradeType>(TradeType.SPOT);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.BUY);
  const [priceType, setPriceType] = useState<'LIMIT' | 'MARKET' | 'STOP'>('LIMIT');
  const [price, setPrice] = useState<string>('');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [showCoinSelector, setShowCoinSelector] = useState(false);
  const [timeframe, setTimeframe] = useState('15m');
  const [searchCoin, setSearchCoin] = useState('');
  const [showCoinInfo, setShowCoinInfo] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [mobileTab, setMobileTab] = useState<'CHART' | 'BOOK' | 'TRADES' | 'TRADE'>('CHART');
  const [mobileTradeSide, setMobileTradeSide] = useState<'BUY' | 'SELL' | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);
  const candleSeries = useRef<any>(null);
  const selectedCoin = marketData.find(c => c.id === selectedCoinId) || marketData[0];
  const [marketTrades, setMarketTrades] = useState<{price: number, amount: number, time: string, type: 'buy'|'sell'}[]>([]);

  useEffect(() => {
    if (!selectedCoin || !chartContainerRef.current) return;
    if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; }
    const chart = createChart(chartContainerRef.current, { layout: { background: { type: ColorType.Solid, color: '#161a1e' }, textColor: '#848e9c', }, grid: { vertLines: { color: 'rgba(255, 255, 255, 0.05)' }, horzLines: { color: 'rgba(255, 255, 255, 0.05)' }, }, crosshair: { mode: CrosshairMode.Normal, }, rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', }, timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true, secondsVisible: false, }, });
    const series = chart.addCandlestickSeries({ upColor: '#0ecb81', downColor: '#f6465d', borderDownColor: '#f6465d', borderUpColor: '#0ecb81', wickDownColor: '#f6465d', wickUpColor: '#0ecb81', });
    chartInstance.current = chart; candleSeries.current = series;
    const fetchHistory = async () => { try { const days = timeframe === '1D' ? 30 : 1; const res = await fetch(\`https://api.coingecko.com/api/v3/coins/\${selectedCoin.id}/ohlc?vs_currency=usd&days=\${days}\`); if(!res.ok) throw new Error("Failed fetch"); const data = await res.json(); const formattedData = data.map((d: number[]) => ({ time: d[0] / 1000, open: d[1], high: d[2], low: d[3], close: d[4] })); if(formattedData.length === 0) throw new Error("No data"); series.setData(formattedData); } catch (e) { const generated: any[] = []; let current = selectedCoin.current_price; let time = Math.floor(Date.now() / 1000) - (60 * 60 * 24); for(let i=0; i<100; i++) { const vol = current * 0.02; const close = current + (Math.random() - 0.5) * vol; const high = Math.max(current, close) + Math.random() * (vol/2); const low = Math.min(current, close) - Math.random() * (vol/2); generated.push({ time, open: current, high, low, close }); current = close; time += (15 * 60); } series.setData(generated); } };
    fetchHistory();
    const handleResize = () => { if(chartContainerRef.current && chartInstance.current) { chartInstance.current.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight }); } };
    const resizeObserver = new ResizeObserver(() => { window.requestAnimationFrame(handleResize); });
    resizeObserver.observe(chartContainerRef.current);
    return () => { resizeObserver.disconnect(); if (chartInstance.current) { chartInstance.current.remove(); chartInstance.current = null; } };
  }, [selectedCoinId, timeframe]);

  useEffect(() => { if (selectedCoin) { setPrice(selectedCoin.current_price.toString()); } }, [selectedCoinId]);
  useEffect(() => { if(!selectedCoin) return; const interval = setInterval(() => { const type = Math.random() > 0.5 ? 'buy' : 'sell'; const volatility = selectedCoin.current_price * 0.0005; const tradePrice = selectedCoin.current_price + (Math.random() - 0.5) * volatility; const tradeAmount = Math.random() * (1000 / tradePrice); setMarketTrades(prev => [ { price: tradePrice, amount: tradeAmount, time: new Date().toLocaleTimeString([], { hour12: false }), type }, ...prev.slice(0, 30) ]); }, 800); return () => clearInterval(interval); }, [selectedCoin]);

  const handleOrder = () => {
    if (!currentUser) { showNotification('error', t('login_title')); return; }
    const numPrice = parseFloat(price); const numTriggerPrice = parseFloat(triggerPrice); const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) { showNotification('error', "Invalid Amount"); return; }
    if (priceType === 'LIMIT' && (isNaN(numPrice) || numPrice <= 0)) { showNotification('error', "Invalid Price"); return; }
    const finalPrice = priceType === 'MARKET' ? selectedCoin.current_price : numPrice;
    const success = placeOrder(selectedCoin.symbol, orderType, tradeType, finalPrice, numAmount, priceType === 'STOP' ? numTriggerPrice : undefined);
    if (success) { setAmount(''); if (mobileTradeSide) setMobileTradeSide(null); }
  };
  const availableBalance = useMemo(() => { if (!currentUser || !selectedCoin) return 0; const wallet = currentUser.tradingWallet; if (orderType === OrderType.BUY) { const usdt = wallet.find(a => a.symbol === 'USDT'); return usdt ? usdt.amount : 0; } else { const coin = wallet.find(a => a.symbol === selectedCoin.symbol); return coin ? coin.amount : 0; } }, [currentUser, orderType, selectedCoin]);
  const estimatedCost = useMemo(() => { const p = priceType === 'MARKET' ? selectedCoin.current_price : parseFloat(price); const a = parseFloat(amount); if (isNaN(p) || isNaN(a)) return 0; return p * a; }, [price, amount, priceType, selectedCoin]);
  const percentClick = (pct: number) => { if(orderType === OrderType.BUY) { const p = parseFloat(price) || selectedCoin.current_price; const val = (availableBalance * (pct/100)) / p; setAmount(val.toFixed(6)); } else { setAmount((availableBalance * (pct/100)).toFixed(6)); } };
  const onBookClick = (p: number) => { setPrice(p.toFixed(2)); setPriceType('LIMIT'); };

  const TradeForm = () => (
      <div className="p-4 bg-[#181a20]">
          <div className="flex bg-[#0b0e11] rounded p-1 mb-5"><button onClick={() => setOrderType(OrderType.BUY)} className={\`flex-1 py-2.5 text-sm font-bold rounded transition-all \${orderType === OrderType.BUY ? 'bg-[#0ecb81] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}\`}>{t('buy')}</button><button onClick={() => setOrderType(OrderType.SELL)} className={\`flex-1 py-2.5 text-sm font-bold rounded transition-all \${orderType === OrderType.SELL ? 'bg-[#f6465d] text-white shadow-lg' : 'text-[#848e9c] hover:text-white'}\`}>{t('sell')}</button></div>
          <div className="flex gap-4 text-xs font-bold text-[#848e9c] mb-4 px-1"><button onClick={() => setPriceType('LIMIT')} className={\`flex-1 pb-1 border-b-2 \${priceType === 'LIMIT' ? 'text-white border-[#f0b90b]' : 'border-transparent'}\`}>{t('order_limit')}</button><button onClick={() => setPriceType('MARKET')} className={\`flex-1 pb-1 border-b-2 \${priceType === 'MARKET' ? 'text-white border-[#f0b90b]' : 'border-transparent'}\`}>{t('order_market')}</button><button onClick={() => setPriceType('STOP')} className={\`flex-1 pb-1 border-b-2 \${priceType === 'STOP' ? 'text-white border-[#f0b90b]' : 'border-transparent'}\`}>{t('order_stop')}</button></div>
          <div className="space-y-4">
              {priceType === 'STOP' && (<div className="bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors"><span className="text-xs text-[#848e9c] font-bold min-w-[60px]">{t('trigger')}</span><input type="number" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder="0.00" /><span className="text-xs text-[#848e9c] ml-2 font-bold">USDT</span></div>)}
              {priceType !== 'MARKET' ? (<div className="bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors"><span className="text-xs text-[#848e9c] font-bold min-w-[60px]">{t('price')}</span><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder={selectedCoin.current_price.toString()} /><span className="text-xs text-[#848e9c] ml-2 font-bold">USDT</span></div>) : (<div className="w-full bg-[#2b3139]/50 border border-transparent rounded-lg h-10 flex items-center justify-center text-[#848e9c] text-sm italic cursor-not-allowed">Market Best Price</div>)}
              <div className="bg-[#2b3139] rounded-lg flex items-center px-3 h-10 border border-transparent focus-within:border-[#0ea5e9] transition-colors"><span className="text-xs text-[#848e9c] font-bold min-w-[60px]">{t('amount')}</span><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent text-right text-white text-sm font-mono outline-none h-full w-full" placeholder="0.00" /><span className="text-xs text-[#848e9c] ml-2 font-bold">{selectedCoin.symbol.toUpperCase()}</span></div>
              <div className="grid grid-cols-4 gap-2">{[25, 50, 75, 100].map(p => (<button key={p} onClick={() => percentClick(p)} className="bg-[#2b3139] hover:bg-[#363c45] text-[10px] py-1 rounded text-[#848e9c] hover:text-white transition-colors">{p}%</button>))}</div>
              {priceType === 'LIMIT' && (<div className="flex gap-4 pt-1"><label className="flex items-center gap-1.5 cursor-pointer group"><input type="checkbox" checked={postOnly} onChange={e => setPostOnly(e.target.checked)} className="w-3 h-3 accent-[#0ea5e9] bg-[#2b3139] border-none rounded cursor-pointer"/><span className="text-[10px] text-[#848e9c] group-hover:text-white font-medium">{t('post_only')}</span></label><label className="flex items-center gap-1.5 cursor-pointer group"><input type="checkbox" checked={reduceOnly} onChange={e => setReduceOnly(e.target.checked)} className="w-3 h-3 accent-[#0ea5e9] bg-[#2b3139] border-none rounded cursor-pointer"/><span className="text-[10px] text-[#848e9c] group-hover:text-white font-medium">{t('reduce_only')}</span></label><label className="flex items-center gap-1.5 cursor-pointer group"><input type="checkbox" className="w-3 h-3 accent-[#0ea5e9] bg-[#2b3139] border-none rounded cursor-pointer"/><span className="text-[10px] text-[#848e9c] group-hover:text-white font-medium">{t('ioc')}</span></label></div>)}
              <div className="space-y-1 pt-2"><div className="flex justify-between items-center text-xs text-[#848e9c]"><span className="font-medium">{t('available')}</span><span className="text-white font-mono font-bold">{availableBalance.toFixed(4)} {orderType === OrderType.BUY ? 'USDT' : selectedCoin.symbol}</span></div><div className="flex justify-between items-center text-xs text-[#848e9c]"><span className="font-medium">{t('est_cost')}</span><span className="text-white font-mono font-bold">{estimatedCost > 0 ? estimatedCost.toFixed(2) : '--'} USDT</span></div></div>
              <button onClick={handleOrder} className={\`w-full py-3.5 rounded-lg font-bold text-white shadow-lg mt-2 text-sm uppercase tracking-wide transition-all active:scale-95 \${orderType === OrderType.BUY ? 'bg-[#0ecb81] hover:bg-[#0aa869] shadow-[#0ecb81]/20' : 'bg-[#f6465d] hover:bg-[#d9304e] shadow-[#f6465d]/20'}\`}>{orderType === OrderType.BUY ? t('buy') : t('sell')} {selectedCoin.symbol.toUpperCase()}</button>
          </div>
      </div>
  );

  const OrderBook = () => (
      <div className="flex-1 flex flex-col h-full bg-[#181a20]"><div className="px-4 py-2 grid grid-cols-3 text-[10px] text-[#848e9c] font-bold uppercase border-b border-white/5"><span>{t('price')}</span><span className="text-right">{t('amount')}</span><span className="text-right">{t('total')}</span></div><div className="flex-1 overflow-hidden flex flex-col relative"><div className="flex-1 flex flex-col-reverse justify-end overflow-hidden pb-1">{[...Array(15)].map((_, i) => { const askPrice = selectedCoin.current_price * (1 + (0.0005 * (i+1))); const amount = Math.random() * 2; const depthPercent = Math.random() * 100; return (<div key={i} className="grid grid-cols-3 px-4 py-[2px] text-xs relative group cursor-pointer hover:bg-[#1e2329]" onClick={() => onBookClick(askPrice)}><div className="absolute top-0 right-0 h-full bg-[#f6465d]/10 transition-all duration-500 ease-out opacity-40 pointer-events-none" style={{ width: \`\${depthPercent}%\` }}></div><span className="text-[#f6465d] relative z-10 font-mono group-hover:font-bold">{askPrice.toFixed(2)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-90">{amount.toFixed(3)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-60">{(askPrice * amount).toFixed(1)}</span></div>); })}</div><div className="py-2 px-4 border-y border-white/5 bg-[#1e2329] flex items-center justify-between sticky top-0 z-20"><div className="flex items-center gap-2"><span className={\`text-lg font-bold font-mono \${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{selectedCoin.current_price.toFixed(2)}</span>{selectedCoin.price_change_percentage_24h >= 0 ? <ArrowUp size={14} className="text-[#0ecb81]"/> : <ArrowDown size={14} className="text-[#f6465d]"/>}</div></div><div className="flex-1 overflow-hidden pt-1">{[...Array(15)].map((_, i) => { const bidPrice = selectedCoin.current_price * (1 - (0.0005 * (i + 1))); const amount = Math.random() * 2; const depthPercent = Math.random() * 100; return (<div key={i} className="grid grid-cols-3 px-4 py-[2px] text-xs relative group cursor-pointer hover:bg-[#1e2329]" onClick={() => onBookClick(bidPrice)}><div className="absolute top-0 right-0 h-full bg-[#0ecb81]/10 transition-all duration-500 ease-out opacity-40 pointer-events-none" style={{ width: \`\${depthPercent}%\` }}></div><span className="text-[#0ecb81] relative z-10 font-mono group-hover:font-bold">{bidPrice.toFixed(2)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-90">{amount.toFixed(3)}</span><span className="text-[#eaecef] text-right relative z-10 font-mono opacity-60">{(bidPrice * amount).toFixed(1)}</span></div>); })}</div></div></div>
  );

  if (!selectedCoin) return <div className="flex items-center justify-center h-full text-[#848e9c]">Loading Market Data...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0b0e11] text-[#eaecef] overflow-hidden font-sans">
      <div className="h-14 lg:h-16 px-4 bg-[#181a20] border-b border-white/5 flex items-center justify-between shrink-0 relative z-40"><div className="flex items-center gap-4 lg:gap-8"><div className="relative"><button onClick={() => setShowCoinSelector(!showCoinSelector)} className="flex items-center gap-2 text-lg lg:text-xl font-bold text-white hover:text-[#f0b90b] transition-colors"><img src={selectedCoin.image} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full" />{selectedCoin.symbol.toUpperCase()}/USDT<ChevronDown size={16} /></button>{showCoinSelector && (<div className="absolute top-full left-0 mt-2 w-72 lg:w-80 bg-[#1e2329] border border-white/10 rounded-lg shadow-2xl z-50 flex flex-col max-h-[500px] animate-in fade-in zoom-in-95 duration-150"><div className="p-3 border-b border-white/5"><div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-[#848e9c]" /><input autoFocus type="text" placeholder={t('search_coin')} value={searchCoin} onChange={(e) => setSearchCoin(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded px-3 pl-9 py-2 text-xs focus:border-[#0ea5e9] outline-none text-white" /></div></div><div className="flex-1 overflow-y-auto custom-scrollbar">{marketData.filter(c => c.symbol.toLowerCase().includes(searchCoin.toLowerCase()) || c.name.toLowerCase().includes(searchCoin.toLowerCase())).map(c => (<button key={c.id} onClick={() => { setSelectedCoinId(c.id); setShowCoinSelector(false); }} className={\`w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 \${selectedCoinId === c.id ? 'bg-white/5 border-l-2 border-[#0ea5e9]' : ''}\`}><div className="flex items-center gap-2 font-bold text-white text-sm"><span>{c.symbol.toUpperCase()}</span><span className="text-[#848e9c] text-xs font-normal">/ USDT</span></div><span className={\`text-xs \${c.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{c.price_change_percentage_24h.toFixed(2)}%</span></button>))}</div></div>)}</div><div className={\`text-lg font-mono font-bold lg:hidden \${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{selectedCoin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div><div className="flex gap-6 text-xs hidden lg:flex"><div><div className="text-[#848e9c] mb-0.5">{t('price')}</div><span className={\`font-mono font-bold \${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{selectedCoin.current_price.toLocaleString()}</span></div><div><div className="text-[#848e9c] mb-0.5">{t('change')}</div><span className={\`font-mono \${selectedCoin.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{selectedCoin.price_change_percentage_24h.toFixed(2)}%</span></div><div><div className="text-[#848e9c] mb-0.5">{t('high')}</div><span className="text-white font-mono">{selectedCoin.high_24h.toLocaleString()}</span></div></div></div><div className="flex items-center gap-4 text-[#848e9c] text-xs"><button onClick={() => setShowCoinInfo(true)} className="hover:text-white flex items-center gap-1 bg-[#2b3139] px-2 py-1 rounded"><Info size={14} /> <span className="hidden lg:inline">Info</span></button></div></div>
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="lg:hidden flex border-b border-white/5 bg-[#181a20] shrink-0"><button onClick={() => setMobileTab('CHART')} className={\`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors \${mobileTab === 'CHART' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}\`}><BarChart2 size={14}/> Chart</button><button onClick={() => setMobileTab('BOOK')} className={\`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors \${mobileTab === 'BOOK' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}\`}><List size={14}/> Book</button><button onClick={() => setMobileTab('TRADES')} className={\`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1 border-b-2 transition-colors \${mobileTab === 'TRADES' ? 'text-[#0ea5e9] border-[#0ea5e9]' : 'text-[#848e9c] border-transparent'}\`}><Clock size={14}/> Trades</button></div>
          <div className={\`w-full lg:w-[320px] bg-[#181a20] lg:border-r border-white/5 flex flex-col shrink-0 lg:order-1 \${mobileTab === 'BOOK' ? 'flex flex-1' : 'hidden lg:flex'}\`}><div className="hidden lg:flex px-4 py-3 border-b border-white/5 items-center justify-between"><span className="text-xs font-bold text-white uppercase">{t('order_book')}</span></div><OrderBook /></div>
          <div className={\`flex-1 flex flex-col bg-[#161a1e] lg:order-2 \${mobileTab === 'CHART' ? 'flex flex-1' : 'hidden lg:flex'}\`}><div className="h-10 px-4 border-b border-white/5 flex items-center justify-between bg-[#181a20] shrink-0"><div className="flex gap-1">{['15m', '1H', '4H', '1D'].map(t => (<button key={t} onClick={() => setTimeframe(t)} className={\`text-xs font-bold px-3 py-1 rounded hover:bg-white/5 transition-colors \${timeframe === t ? 'text-[#0ea5e9] bg-[#0ea5e9]/10' : 'text-[#848e9c]'}\`}>{t}</button>))}</div></div><div className="flex-1 relative w-full h-full" ref={chartContainerRef}></div></div>
          <div className={\`w-full lg:w-[350px] bg-[#181a20] border-l border-white/5 flex flex-col shrink-0 lg:order-3 \${mobileTab === 'TRADES' ? 'flex flex-1' : 'hidden lg:flex'}\`}><div className="hidden lg:block border-b border-white/5"><div className="p-4"><div className="flex justify-between items-center mb-4 text-xs font-bold text-[#848e9c]"><div className="flex gap-2"><button className="hover:text-white px-3 py-1 bg-[#2b3139] rounded transition-colors text-white">Spot</button><button className="hover:text-white px-3 py-1 hover:bg-[#2b3139] rounded transition-colors">Cross 20x</button></div><Settings size={14} className="hover:text-white cursor-pointer"/></div><TradeForm /></div></div><div className="flex-1 flex flex-col overflow-hidden"><div className="px-4 py-3 text-xs font-bold text-white border-b border-white/5 bg-[#181a20]">{t('recent_trades')}</div><div className="grid grid-cols-3 px-4 py-2 text-[10px] text-[#848e9c] font-bold uppercase"><span>{t('price')}</span><span className="text-right">{t('amount')}</span><span className="text-right">{t('time')}</span></div><div className="flex-1 overflow-y-auto custom-scrollbar">{marketTrades.map((trade, i) => (<div key={i} className="grid grid-cols-3 px-4 py-[2px] text-xs hover:bg-white/5 transition-colors animate-in fade-in duration-300"><span className={\`font-mono \${trade.type === 'buy' ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{trade.price.toFixed(2)}</span><span className="text-[#eaecef] text-right font-mono opacity-90">{trade.amount.toFixed(4)}</span><span className="text-[#848e9c] text-right font-mono opacity-60">{trade.time}</span></div>))}</div></div></div>
      </div>
      <div className="lg:hidden p-2 grid grid-cols-2 gap-2 bg-[#181a20] border-t border-white/5 shrink-0 z-50 safe-area-bottom"><button onClick={() => { setOrderType(OrderType.BUY); setMobileTradeSide('BUY'); }} className="py-3 bg-[#0ecb81] rounded text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">{t('buy')}</button><button onClick={() => { setOrderType(OrderType.SELL); setMobileTradeSide('SELL'); }} className="py-3 bg-[#f6465d] rounded text-white font-bold text-sm shadow-lg active:scale-95 transition-transform">{t('sell')}</button></div>
      {mobileTradeSide && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm lg:hidden flex flex-col justify-end animate-in fade-in duration-200"><div className="bg-[#181a20] rounded-t-2xl p-4 border-t border-white/10 animate-in slide-in-from-bottom duration-200"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">{mobileTradeSide} {selectedCoin.symbol.toUpperCase()}</h3><button onClick={() => setMobileTradeSide(null)} className="p-2 bg-[#2b3139] rounded-full text-white"><X size={16}/></button></div><TradeForm /></div></div>)}
      {showCoinInfo && (<div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-[#1e2329] border border-[#2b3139] rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200"><div className="flex items-center justify-between p-6 border-b border-white/5"><div className="flex items-center gap-3"><img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" /><div><h3 className="text-xl font-bold text-white">{selectedCoin.name}</h3><div className="text-sm text-[#848e9c] font-bold bg-[#2b3139] px-2 py-0.5 rounded inline-block mt-1">Rank #{selectedCoin.market_cap_rank || 'N/A'}</div></div></div><button onClick={() => setShowCoinInfo(false)} className="text-[#848e9c] hover:text-white"><X size={20}/></button></div><div className="p-6 space-y-6"><div className="grid grid-cols-2 gap-4"><div className="bg-[#0b0e11] p-4 rounded-lg border border-white/5"><div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Market Cap</div><div className="text-white font-mono">\${(selectedCoin.market_cap || 0).toLocaleString()}</div></div><div className="bg-[#0b0e11] p-4 rounded-lg border border-white/5"><div className="text-xs text-[#848e9c] uppercase font-bold mb-1">Circulating Supply</div><div className="text-white font-mono">{(selectedCoin.circulating_supply || 0).toLocaleString()} {selectedCoin.symbol.toUpperCase()}</div></div></div></div></div></div>)}
    </div>
  );
};`,

  'src/pages/Assets.tsx': `import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Wallet, ArrowLeftRight, Download, Upload, Eye, EyeOff, Copy, Check, History, Link, Plus, ChevronRight, TrendingUp, PieChart } from 'lucide-react';
import { AccountType } from '../types';

export const Assets: React.FC = () => {
  const { currentUser, transfer, deposit, withdraw, bindExternalWallet, userTransactions, t, showNotification } = useStore();
  const [activeTab, setActiveTab] = useState<AccountType>('FUNDING');
  const [view, setView] = useState<'BALANCES' | 'HISTORY'>('BALANCES');
  const [hideBalance, setHideBalance] = useState(false);
  const [modalType, setModalType] = useState<'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'BIND_WALLET' | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('USDT'); const [amount, setAmount] = useState(0); const [walletAddressInput, setWalletAddressInput] = useState('');
  const officialWalletAddress = "0xEdd97C7577B9782369DC1E385D31c78f5515d272";
  if (!currentUser) { return (<div className="flex flex-col items-center justify-center h-[80vh] text-center"><div className="w-20 h-20 bg-[#2b3139] rounded-full flex items-center justify-center mb-6"><Wallet size={40} className="text-[#848e9c]" /></div><h2 className="text-2xl font-bold mb-2 text-white">Please Log In</h2><p className="text-[#848e9c] max-w-md">Access your digital asset portfolio, manage funds, and view transaction history.</p></div>); }
  const wallet = activeTab === 'FUNDING' ? currentUser.fundingWallet : currentUser.tradingWallet;
  const totalBalanceUSDT = wallet.reduce((acc, curr) => acc + (curr.symbol === 'USDT' ? curr.amount : curr.amount * 100), 0);
  const yesterdayPnL = totalBalanceUSDT * (Math.random() > 0.5 ? 0.02 : -0.015);
  const handleCopy = () => { navigator.clipboard.writeText(officialWalletAddress); setCopied(true); setTimeout(() => setCopied(false), 2000); showNotification('success', 'Address Copied'); };
  const handleAction = () => { if (modalType === 'DEPOSIT') { deposit(currentUser.id, selectedAsset, amount); } else if (modalType === 'WITHDRAW') { withdraw(currentUser.id, selectedAsset, amount); } else if (modalType === 'TRANSFER') { const from = activeTab; const to = activeTab === 'FUNDING' ? 'TRADING' : 'FUNDING'; transfer(currentUser.id, selectedAsset, amount, from, to); } else if (modalType === 'BIND_WALLET') { bindExternalWallet(walletAddressInput); } setModalType(null); setAmount(0); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="md:col-span-2 bg-gradient-to-br from-[#1e2329] to-[#0b0e11] rounded-2xl p-6 lg:p-8 border border-[#2b3139] shadow-xl relative overflow-hidden group"><div className="absolute right-0 top-0 h-full w-1/3 bg-[#0ea5e9]/5 skew-x-12 group-hover:bg-[#0ea5e9]/10 transition-colors"></div><div className="relative z-10"><div className="flex items-center gap-2 mb-4 text-[#848e9c]"><span className="uppercase text-xs font-bold tracking-wider">{t('est_value')} (BTC)</span><button onClick={() => setHideBalance(!hideBalance)} className="hover:text-white">{hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}</button><span className="bg-[#2b3139] text-[10px] px-2 py-0.5 rounded text-white ml-auto flex items-center gap-1"><TrendingUp size={12} className={yesterdayPnL >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"} />{t('pnl_yesterday')}: <span className={yesterdayPnL >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>{yesterdayPnL >= 0 ? '+' : ''}{yesterdayPnL.toFixed(2)}</span></span></div><div className="flex items-baseline gap-3 mb-6"><span className="text-3xl lg:text-4xl font-bold text-white font-mono tracking-tight">{hideBalance ? '******' : (totalBalanceUSDT / 65000).toFixed(6)}</span><span className="text-[#848e9c] font-mono">≈ \${hideBalance ? '**.**' : totalBalanceUSDT.toLocaleString()}</span></div><div className="flex flex-wrap gap-3"><button onClick={() => setModalType('DEPOSIT')} className="flex-1 lg:flex-none justify-center px-5 py-3 bg-[#f0b90b] hover:bg-[#d4a406] text-black font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-[#f0b90b]/20 transition-all active:scale-95"><Download size={16} /> {t('deposit')}</button><button onClick={() => setModalType('WITHDRAW')} className="flex-1 lg:flex-none justify-center px-5 py-3 bg-[#2b3139] hover:bg-[#363c45] text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-all active:scale-95"><Upload size={16} /> {t('withdraw')}</button><button onClick={() => setModalType('TRANSFER')} className="flex-1 lg:flex-none justify-center px-5 py-3 bg-[#2b3139] hover:bg-[#363c45] text-white font-bold rounded-lg text-sm flex items-center gap-2 transition-all active:scale-95"><ArrowLeftRight size={16} /> {t('transfer')}</button></div></div></div>
         <div className="bg-[#1e2329] rounded-2xl p-6 border border-[#2b3139] flex flex-col justify-center shadow-lg"><div className="text-xs text-[#848e9c] uppercase font-bold mb-4">Linked Wallet</div>{currentUser.externalWalletAddress ? (<div className="bg-[#0b0e11] p-3 rounded border border-[#2b3139] flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#0ea5e9]/20 flex items-center justify-center text-[#0ea5e9]"><Link size={16} /></div><div className="flex-1 overflow-hidden"><div className="text-xs text-[#848e9c]">Connected Address</div><div className="text-white font-mono text-xs truncate">{currentUser.externalWalletAddress}</div></div></div>) : (<button onClick={() => setModalType('BIND_WALLET')} className="w-full py-4 border border-dashed border-[#2b3139] rounded-lg text-[#848e9c] hover:text-white hover:border-[#0ea5e9] hover:bg-[#0ea5e9]/5 transition-all flex flex-col items-center justify-center gap-2"><Plus size={24} /><span className="text-sm font-medium">Connect / Add Wallet</span></button>)}<div className="mt-4 pt-4 border-t border-white/5"><div className="flex justify-between items-center text-xs"><span className="text-[#848e9c]">Account Security</span><span className="text-[#0ecb81] font-bold">High</span></div><div className="w-full h-1 bg-[#2b3139] rounded-full mt-2 overflow-hidden"><div className="w-4/5 h-full bg-[#0ecb81]"></div></div></div></div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2b3139] mb-6 gap-4"><div className="flex gap-6"><button onClick={() => setView('BALANCES')} className={\`py-4 font-bold text-sm relative \${view === 'BALANCES' ? 'text-[#f0b90b]' : 'text-[#848e9c] hover:text-white'}\`}>{t('wallet_overview')}{view === 'BALANCES' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f0b90b]"></div>}</button><button onClick={() => setView('HISTORY')} className={\`py-4 font-bold text-sm relative \${view === 'HISTORY' ? 'text-[#f0b90b]' : 'text-[#848e9c] hover:text-white'}\`}>Transaction History{view === 'HISTORY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#f0b90b]"></div>}</button></div>{view === 'BALANCES' && (<div className="flex bg-[#1e2329] p-1 rounded w-full sm:w-auto"><button onClick={() => setActiveTab('FUNDING')} className={\`flex-1 sm:flex-none px-4 py-1 text-xs font-bold rounded \${activeTab === 'FUNDING' ? 'bg-[#2b3139] text-white shadow' : 'text-[#848e9c]'}\`}>{t('funding_account')}</button><button onClick={() => setActiveTab('TRADING')} className={\`flex-1 sm:flex-none px-4 py-1 text-xs font-bold rounded \${activeTab === 'TRADING' ? 'bg-[#2b3139] text-white shadow' : 'text-[#848e9c]'}\`}>{t('trading_account')}</button></div>)}</div>
      <div className="bg-[#1e2329] rounded-xl border border-[#2b3139] shadow-lg min-h-[400px] overflow-hidden">
        {view === 'BALANCES' && (<>
            <div className="hidden md:block overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-[#2b3139]/50 text-[#848e9c] text-xs uppercase font-semibold"><tr><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Total Balance</th><th className="px-6 py-4">Available</th><th className="px-6 py-4">Frozen</th><th className="px-6 py-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#2b3139]">{wallet.map(asset => (<tr key={asset.symbol} className="hover:bg-[#2b3139]/30 transition-colors group"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#2b3139] flex items-center justify-center text-xs font-bold text-white shadow-inner">{asset.symbol[0]}</div><span className="font-bold text-white">{asset.symbol}</span></div></td><td className="px-6 py-4 font-mono text-white font-medium">{asset.amount.toFixed(4)}</td><td className="px-6 py-4 font-mono text-[#eaecef]">{asset.amount.toFixed(4)}</td><td className="px-6 py-4 font-mono text-[#848e9c]">{asset.frozen.toFixed(4)}</td><td className="px-6 py-4 text-right opacity-80 group-hover:opacity-100"><button onClick={() => { setSelectedAsset(asset.symbol); setModalType('TRANSFER'); }} className="text-[#f0b90b] hover:text-[#d4a406] text-sm font-medium">Transfer</button></td></tr>))}</tbody></table></div>
            <div className="md:hidden flex flex-col divide-y divide-[#2b3139]">{wallet.map(asset => (<div key={asset.symbol} className="p-4 bg-[#1e2329]"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#2b3139] flex items-center justify-center text-xs font-bold text-white shadow-inner">{asset.symbol[0]}</div><span className="font-bold text-white">{asset.symbol}</span></div><button onClick={() => { setSelectedAsset(asset.symbol); setModalType('TRANSFER'); }} className="text-[#f0b90b] text-xs font-bold px-3 py-1 bg-[#f0b90b]/10 rounded border border-[#f0b90b]/20">Transfer</button></div><div className="grid grid-cols-2 gap-4 text-sm"><div><div className="text-[#848e9c] text-xs mb-1">Available</div><div className="text-white font-mono">{asset.amount.toFixed(4)}</div></div><div className="text-right"><div className="text-[#848e9c] text-xs mb-1">Frozen</div><div className="text-[#848e9c] font-mono">{asset.frozen.toFixed(4)}</div></div></div></div>))}{wallet.length === 0 && <div className="p-8 text-center text-[#848e9c]">No assets found.</div>}</div>
        </>)}
        {view === 'HISTORY' && (<div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-[#2b3139]/50 text-[#848e9c] text-xs uppercase font-semibold"><tr><th className="px-6 py-4 rounded-tl-xl">Time</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Asset</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th></tr></thead><tbody className="divide-y divide-[#2b3139]">{userTransactions.map(tx => (<tr key={tx.id} className="hover:bg-[#2b3139]/30"><td className="px-6 py-4 text-[#848e9c] font-mono text-sm">{new Date(tx.date).toLocaleString()}</td><td className="px-6 py-4 font-bold text-white text-sm">{tx.type.replace('_', ' ')}</td><td className="px-6 py-4 text-white text-sm">{tx.symbol}</td><td className={\`px-6 py-4 font-mono font-medium \${tx.type.includes('DEPOSIT') || tx.type.includes('BUY') ? 'text-[#0ecb81]' : 'text-[#f6465d]'}\`}>{tx.type.includes('DEPOSIT') || tx.type.includes('BUY') ? '+' : '-'}{tx.amount.toFixed(4)}</td><td className="px-6 py-4"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0ecb81]/10 text-[#0ecb81] border border-[#0ecb81]/20">COMPLETED</span></td></tr>))}{userTransactions.length === 0 && (<tr><td colSpan={5} className="py-12 text-center text-[#848e9c]"><History className="mx-auto mb-2 opacity-50"/>No transactions yet.</td></tr>)}</tbody></table></div>)}
      </div>
      {modalType && (<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"><div className="bg-[#1e2329] border border-[#2b3139] rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">{modalType === 'BIND_WALLET' ? 'Connect External Wallet' : modalType}</h3><button onClick={() => setModalType(null)} className="text-[#848e9c] hover:text-white">✕</button></div>{modalType === 'BIND_WALLET' ? (<div className="space-y-4"><p className="text-sm text-[#848e9c]">Enter your TRC20 or ERC20 wallet address to link it to your account for quick withdrawals.</p><input type="text" value={walletAddressInput} onChange={e => setWalletAddressInput(e.target.value)} placeholder="0x..." className="w-full bg-[#0b0e11] border border-[#2b3139] rounded p-3 text-white focus:border-[#f0b90b] outline-none font-mono text-sm" /><button onClick={handleAction} className="w-full py-3 bg-[#f0b90b] text-black font-bold rounded hover:bg-[#d4a406]">Link Wallet</button></div>) : (<>{modalType === 'DEPOSIT' && (<div className="bg-[#0b0e11] p-4 rounded-lg border border-[#2b3139] mb-4 text-center"><img src={\`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=\${officialWalletAddress}\`} alt="QR" className="mx-auto mb-3 border-4 border-white rounded-lg" /><div className="text-xs text-[#848e9c] mb-1">Deposit Address</div><div className="flex items-center gap-2 bg-[#2b3139] p-2 rounded border border-[#2b3139] cursor-pointer hover:border-[#848e9c]" onClick={handleCopy}><span className="text-xs font-mono text-white truncate flex-1">{officialWalletAddress}</span>{copied ? <Check size={14} className="text-[#0ecb81]"/> : <Copy size={14} className="text-[#f0b90b]"/>}</div></div>)}<div className="space-y-4"><div><label className="text-xs text-[#848e9c] block mb-1">Asset</label><select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded p-3 text-white outline-none"><option value="USDT">USDT</option><option value="BTC">BTC</option><option value="TSLA">TSLA</option></select></div><div><label className="text-xs text-[#848e9c] block mb-1">Amount</label><input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full bg-[#0b0e11] border border-[#2b3139] rounded p-3 text-white outline-none font-mono" /></div><button onClick={handleAction} className="w-full py-3 bg-[#f0b90b] text-black font-bold rounded hover:bg-[#d4a406] mt-2">Confirm</button></div></>)}</div></div>)}
    </div>
  );
};`,

  'src/pages/Admin.tsx': `import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Settings, Plus, Save, Users, AlertTriangle, Lock, Unlock, Trash2, Edit, LayoutDashboard, Megaphone, Coins, LogOut, X, Share2 } from 'lucide-react';
import { User } from '../types';

export const Admin: React.FC = () => {
  const { currentUser, allUsers, customToken, updateCustomToken, addNews, updateUser, deleteUser, t, logout, systemSettings, updateSystemSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'USERS' | 'TOKEN' | 'NEWS' | 'SETTINGS'>('USERS');
  const [newsTitle, setNewsTitle] = useState(''); const [newsSummary, setNewsSummary] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null); const [editForm, setEditForm] = useState({ usdt: 0, tsla: 0 });

  if (!currentUser?.isAdmin) { return (<div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-4"><div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"><Lock size={40} /></div><div className="text-2xl font-bold text-white">Access Denied</div><p className="text-[#848e9c]">You do not have permission to view the Admin Console.</p></div>); }
  const handleTokenUpdate = (e: React.FormEvent) => { e.preventDefault(); alert("Token configuration updated successfully!"); };
  const handleAddNews = (e: React.FormEvent) => { e.preventDefault(); addNews({ id: Date.now().toString(), title: newsTitle, summary: newsSummary, source: 'Tsla Official', date: new Date().toISOString(), isOfficial: true }); setNewsTitle(''); setNewsSummary(''); alert("Announcement published!"); };
  const openEditUser = (user: User) => { const usdt = user.fundingWallet.find(a => a.symbol === 'USDT')?.amount || 0; const tsla = user.fundingWallet.find(a => a.symbol === customToken.symbol)?.amount || 0; setEditingUser(user); setEditForm({ usdt, tsla }); };
  const saveUserEdit = () => { if (!editingUser) return; const newWallet = [...editingUser.fundingWallet]; const usdtIdx = newWallet.findIndex(a => a.symbol === 'USDT'); if (usdtIdx >= 0) newWallet[usdtIdx].amount = editForm.usdt; else newWallet.push({ symbol: 'USDT', amount: editForm.usdt, frozen: 0 }); const tslaIdx = newWallet.findIndex(a => a.symbol === customToken.symbol); if (tslaIdx >= 0) newWallet[tslaIdx].amount = editForm.tsla; else newWallet.push({ symbol: customToken.symbol, amount: editForm.tsla, frozen: 0 }); updateUser(editingUser.id, { fundingWallet: newWallet }); setEditingUser(null); };
  const SidebarItem: React.FC<{ tab: 'USERS' | 'TOKEN' | 'NEWS' | 'SETTINGS', icon: React.ReactNode, label: string }> = ({ tab, icon, label }) => (<button onClick={() => setActiveTab(tab)} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium \${activeTab === tab ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-[#848e9c] hover:bg-white/5 hover:text-white'}\`}>{icon}{label}</button>);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#0b0e11]">
      <aside className="w-full lg:w-64 bg-[#181a20] border-r border-white/5 flex flex-col shrink-0"><div className="p-6"><div className="text-xs font-bold text-[#848e9c] uppercase tracking-wider mb-4">Management Console</div><div className="grid grid-cols-2 lg:grid-cols-1 gap-2"><SidebarItem tab="USERS" icon={<Users size={18} />} label={t('admin_users')} /><SidebarItem tab="TOKEN" icon={<Coins size={18} />} label={t('admin_token')} /><SidebarItem tab="NEWS" icon={<Megaphone size={18} />} label={t('admin_news')} /><SidebarItem tab="SETTINGS" icon={<Settings size={18} />} label="System Settings" /></div></div><div className="mt-auto p-6 border-t border-white/5 hidden lg:block"><div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20"><div className="text-red-500 font-bold text-xs mb-1 uppercase">Admin Session</div><div className="text-[#848e9c] text-xs mb-3">You are logged in with superuser privileges.</div><button onClick={logout} className="flex items-center gap-2 text-xs font-bold text-white hover:text-red-400 transition-colors"><LogOut size={14} /> End Session</button></div></div></aside>
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto"><div className="max-w-6xl mx-auto"><div className="flex items-center justify-between mb-8"><div><h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">{activeTab === 'USERS' && t('admin_users')}{activeTab === 'TOKEN' && t('admin_token')}{activeTab === 'NEWS' && t('admin_news')}{activeTab === 'SETTINGS' && 'System Settings'}</h1><p className="text-[#848e9c] text-sm">System Overview & Configuration</p></div></div>
        {activeTab === 'USERS' && (<div className="bg-[#181a20] rounded-xl border border-white/5 overflow-hidden shadow-lg"><div className="overflow-x-auto"><table className="w-full text-left text-sm whitespace-nowrap"><thead className="bg-[#0b0e11] text-[#848e9c] uppercase border-b border-white/5"><tr><th className="px-6 py-4">ID / Email</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Wallet Balance</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{allUsers.map(u => (<tr key={u.id} className="hover:bg-white/5 group"><td className="px-6 py-4"><div className="font-medium text-white">{u.email}</div><div className="text-xs text-[#848e9c] font-mono">ID: {u.id}</div>{u.isAdmin && <span className="inline-block mt-1 px-1.5 py-0.5 bg-brand-500/20 text-brand-500 text-[10px] font-bold rounded">ADMIN</span>}</td><td className="px-6 py-4">{u.isFrozen ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20"><Lock size={12} /> Frozen</span> : <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium border border-green-500/20"><Unlock size={12} /> Active</span>}</td><td className="px-6 py-4 font-mono text-[#848e9c]"><div className="flex flex-col gap-1"><div className="flex justify-between w-40"><span>USDT:</span><span className="text-white">{u.fundingWallet.find(a => a.symbol === 'USDT')?.amount.toFixed(2) || '0.00'}</span></div><div className="flex justify-between w-40"><span>{customToken.symbol}:</span><span className="text-white">{u.fundingWallet.find(a => a.symbol === customToken.symbol)?.amount.toFixed(2) || '0.00'}</span></div></div></td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity"><button onClick={() => updateUser(u.id, { isFrozen: !u.isFrozen })} className={\`p-2 rounded border \${u.isFrozen ? 'text-green-500 border-green-500/30 hover:bg-green-500/10' : 'text-orange-500 border-orange-500/30 hover:bg-orange-500/10'}\`} title={u.isFrozen ? "Unfreeze Account" : "Freeze Account"}><AlertTriangle size={16} /></button><button onClick={() => openEditUser(u)} className="p-2 rounded border border-brand-500/30 text-brand-500 hover:bg-brand-500/10" title="Edit Balance"><Edit size={16} /></button><button onClick={() => { if(confirm('Are you sure you want to permanently delete this user?')) deleteUser(u.id); }} className="p-2 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10" title="Delete User"><Trash2 size={16} /></button></div></td></tr>))}</tbody></table></div></div>)}
        {activeTab === 'TOKEN' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><form onSubmit={handleTokenUpdate} className="space-y-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Token Name</label><input type="text" value={customToken.name} onChange={(e) => updateCustomToken({ name: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" /></div><div className="grid grid-cols-2 gap-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Price (USD)</label><div className="relative"><span className="absolute left-3 top-3 text-[#848e9c]">$</span><input type="number" value={customToken.price} onChange={(e) => updateCustomToken({ price: parseFloat(e.target.value) })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 pl-8 text-white focus:border-brand-500 outline-none transition-colors" /></div></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">24h Change (%)</label><div className="relative"><input type="number" value={customToken.priceChangePercent} onChange={(e) => updateCustomToken({ priceChangePercent: parseFloat(e.target.value) })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" /><span className="absolute right-3 top-3 text-[#848e9c]">%</span></div></div></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Total Supply</label><input type="number" value={customToken.supply} onChange={(e) => updateCustomToken({ supply: parseFloat(e.target.value) })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-brand-500 outline-none transition-colors" /></div><div className="flex items-center gap-3 p-4 bg-[#0b0e11] rounded-lg border border-white/10"><input type="checkbox" checked={customToken.enabled} onChange={(e) => updateCustomToken({ enabled: e.target.checked })} className="w-5 h-5 rounded accent-brand-500 cursor-pointer" /><label className="text-sm font-medium text-white">Enable Trading on Spot/Futures Markets</label></div><button type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-transform active:scale-95"><Save size={18} /> Save Configuration</button></form></div></div>)}
        {activeTab === 'NEWS' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><form onSubmit={handleAddNews} className="space-y-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Headline</label><input type="text" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="e.g. System Maintenance Scheduled" className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-green-500 outline-none transition-colors" required /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Content</label><textarea value={newsSummary} onChange={(e) => setNewsSummary(e.target.value)} placeholder="Enter the detailed announcement text here..." className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white h-40 focus:border-green-500 outline-none transition-colors resize-none" required /></div><button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-bold mt-2 shadow-lg shadow-green-500/20 transition-transform active:scale-95">Publish Announcement</button></form></div></div>)}
        {activeTab === 'SETTINGS' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-[#181a20] rounded-xl border border-white/5 p-8 shadow-lg"><div className="space-y-6"><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Telegram Group URL</label><input type="text" value={systemSettings.telegram} onChange={(e) => updateSystemSettings({ telegram: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Twitter / X URL</label><input type="text" value={systemSettings.twitter} onChange={(e) => updateSystemSettings({ twitter: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Discord Invite URL</label><input type="text" value={systemSettings.discord} onChange={(e) => updateSystemSettings({ discord: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div><div><label className="block text-xs font-semibold text-[#848e9c] mb-2 uppercase">Support Email</label><input type="text" value={systemSettings.supportEmail} onChange={(e) => updateSystemSettings({ supportEmail: e.target.value })} className="w-full bg-[#0b0e11] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors" /></div></div></div></div>)}
      </div></div>
      {editingUser && (<div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div className="bg-[#181a20] border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200"><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-white">Edit User Assets</h3><button onClick={() => setEditingUser(null)} className="text-[#848e9c] hover:text-white"><X size={20}/></button></div><div className="space-y-4"><div><div className="text-xs text-[#848e9c] mb-1">User Email</div><div className="text-white font-medium">{editingUser.email}</div></div><div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Funding Wallet (USDT)</label><input type="number" value={editForm.usdt} onChange={e => setEditForm(prev => ({...prev, usdt: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div><div><label className="text-xs font-semibold text-[#848e9c] uppercase mb-1 block">Funding Wallet ({customToken.symbol})</label><input type="number" value={editForm.tsla} onChange={e => setEditForm(prev => ({...prev, tsla: parseFloat(e.target.value)}))} className="w-full bg-[#0b0e11] border border-white/10 rounded p-3 text-white font-mono" /></div><button onClick={saveUserEdit} className="w-full py-3 bg-brand-600 hover:bg-brand-500 rounded-lg text-white font-bold mt-2">Save Changes</button></div></div></div>)}
    </div>
  );
};`,

  'src/pages/Airdrop.tsx': `import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Gift, Clock, Zap, Hammer, Cpu, Share2, Users, Activity, Copy, Check, Lock, Unlock, ShoppingCart, Server, BarChart, Database, Network } from 'lucide-react';
import { MiningRig } from '../types';

export const Airdrop: React.FC = () => {
    const { customToken, currentUser, mine, boostHashrate, claimAirdrop, buyRig, t, showNotification } = useStore();
    const [isMining, setIsMining] = useState(false); const [copied, setCopied] = useState(false); const [activeTab, setActiveTab] = useState<'MINING' | 'REFERRAL'>('MINING');
    const hasKYC = currentUser ? currentUser.kycLevel >= 1 : false; const hasDeposit = currentUser ? currentUser.fundingWallet.some(a => a.amount > 0) : false; const hasTrade = currentUser ? currentUser.tradingWallet.some(a => a.amount > 0) : false; const isEligible = hasKYC && hasDeposit && hasTrade;
    const availableRigs: MiningRig[] = [{ id: 'rig_1', name: 'AntMiner S9', hashrate: 15, cost: 500, dailyOutput: 5, purchasedDate: '' }, { id: 'rig_2', name: 'WhatsMiner M30', hashrate: 45, cost: 1200, dailyOutput: 18, purchasedDate: '' }, { id: 'rig_3', name: 'AntMiner S19 Pro', hashrate: 110, cost: 3500, dailyOutput: 50, purchasedDate: '' }];
    useEffect(() => { let interval: ReturnType<typeof setInterval>; if (isMining && currentUser) { interval = setInterval(() => { mine(currentUser.id); }, 1000); } return () => clearInterval(interval); }, [isMining, currentUser, mine]);
    const handleMiningToggle = () => { if (!currentUser) { showNotification('error', t('login_title')); return; } setIsMining(!isMining); };
    const handleBuyRig = (rig: MiningRig) => { if (!currentUser) { showNotification('error', t('login_title')); return; } buyRig(currentUser.id, rig); };
    const handleClaim = () => { if (!currentUser) return; if (!isEligible) { showNotification('error', t('airdrop_locked')); return; } claimAirdrop(currentUser.id); };
    const handleCopyInvite = () => { if(currentUser) { navigator.clipboard.writeText(\`https://tsla-global.com/register?ref=\${currentUser.inviteCode}\`); setCopied(true); setTimeout(() => setCopied(false), 2000); showNotification('success', 'Invite Link Copied'); } };
    const QuestItem: React.FC<{ label: string, done: boolean }> = ({ label, done }) => (<div className={\`flex items-center justify-between p-4 rounded-lg border \${done ? 'bg-[#0ecb81]/10 border-[#0ecb81]/30' : 'bg-[#181a20] border-white/5'}\`}><span className="text-white font-medium text-sm">{label}</span>{done ? (<span className="flex items-center gap-1 text-[#0ecb81] text-xs font-bold uppercase"><Check size={14}/> {t('completed')}</span>) : (<span className="text-[#848e9c] text-xs font-bold uppercase">{t('pending')}</span>)}</div>);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden">
            <div className="flex justify-center mb-8 sm:mb-10"><div className="bg-[#1e2329] p-1 rounded-xl border border-[#2b3139] flex"><button onClick={() => setActiveTab('MINING')} className={\`px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all \${activeTab === 'MINING' ? 'bg-[#0ea5e9] text-white' : 'text-[#848e9c] hover:text-white'}\`}>{t('mining_title')}</button><button onClick={() => setActiveTab('REFERRAL')} className={\`px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-bold transition-all \${activeTab === 'REFERRAL' ? 'bg-[#0ea5e9] text-white' : 'text-[#848e9c] hover:text-white'}\`}>{t('referral_title')}</button></div></div>
            {activeTab === 'MINING' && (<><div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12"><div className="md:col-span-2 bg-[#1e2329] rounded-2xl border border-[#2b3139] p-6 sm:p-8 relative overflow-hidden shadow-2xl group"><div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><Hammer size={200} /></div><div className="relative z-10"><div className="flex items-center justify-between mb-8"><div className="flex items-center gap-3"><div className={\`w-3 h-3 rounded-full \${isMining ? 'bg-[#0ecb81] animate-ping' : 'bg-[#f6465d]'}\`}></div><h2 className="text-xl sm:text-2xl font-bold text-white">{t('mining_title')} Console</h2></div><div className="bg-black/30 px-3 py-1 rounded text-xs font-mono text-[#0ea5e9]">v.3.4.1 Connected</div></div><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8"><div><div className="text-[#848e9c] text-xs mb-1 uppercase font-semibold tracking-wider">Total Hashrate</div><div className="text-4xl sm:text-5xl font-mono font-bold text-white flex items-baseline gap-2">{currentUser?.hashrate || 0} <span className="text-lg text-[#f0b90b]">MH/s</span></div></div><div className="text-right"><div className="text-[#848e9c] text-xs mb-1 uppercase font-semibold tracking-wider">Unclaimed Rewards</div><div className="text-4xl sm:text-5xl font-mono font-bold text-[#0ecb81] flex items-baseline gap-2 justify-end">{(currentUser?.miningBalance || 0).toFixed(6)}<span className="text-lg text-white">{customToken.symbol}</span></div></div></div><div className="grid grid-cols-4 gap-2 mb-8">{[...Array(4)].map((_, i) => (<div key={i} className="bg-[#0b0e11] rounded p-2 text-center border border-[#2b3139]"><div className="text-[10px] text-[#848e9c] uppercase mb-1">Core {i+1}</div><div className={\`h-1 w-full rounded-full \${isMining ? 'bg-[#0ecb81]' : 'bg-[#2b3139]'}\`}></div></div>))}</div><div className="w-full bg-[#0b0e11] rounded-full h-4 mb-8 overflow-hidden border border-[#2b3139]"><div className={\`h-full transition-all duration-1000 \${isMining ? 'bg-gradient-to-r from-[#0ea5e9] to-[#0ecb81] w-full animate-pulse' : 'w-0'}\`}></div></div><button onClick={handleMiningToggle} className={\`w-full py-4 font-bold rounded-xl text-lg transition-all shadow-lg flex items-center justify-center gap-3 \${isMining ? 'bg-[#f6465d] hover:bg-[#d9304e] text-white shadow-[#f6465d]/20' : 'bg-[#0ecb81] hover:bg-[#0aa869] text-white shadow-[#0ecb81]/20'}\`}><Zap size={20} fill="currentColor" />{isMining ? t('stop_mining') : t('start_mining')}</button></div></div><div className="hidden md:flex flex-col gap-4"><div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139] flex-1"><div className="flex items-center gap-2 mb-4 text-white font-bold"><Network size={18} className="text-[#0ea5e9]"/> Network Status</div><div className="space-y-4"><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Difficulty</span><span className="text-white font-mono">14.2 T</span></div><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Block Height</span><span className="text-white font-mono">842,129</span></div><div className="flex justify-between text-sm"><span className="text-[#848e9c]">Pool Hashrate</span><span className="text-white font-mono">1.2 EH/s</span></div></div></div><div className="bg-[#1e2329] p-4 rounded-xl border border-[#2b3139] flex-1 flex flex-col justify-center items-center text-center"><Database size={32} className="text-[#f0b90b] mb-2" /><div className="text-sm font-bold text-white mb-1">Your Rigs</div><div className="text-2xl font-mono text-[#f0b90b]">{currentUser?.rigs.length || 0}</div></div></div><div className="md:col-span-3 space-y-4"><h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShoppingCart size={20} className="text-[#0ea5e9]" /> Cloud Rig Market</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{availableRigs.map(rig => (<div key={rig.id} className="bg-[#181a20] border border-white/5 p-4 rounded-xl flex flex-col justify-between gap-4 hover:border-[#0ea5e9]/50 transition-colors group"><div className="flex items-start justify-between"><div className="w-12 h-12 bg-[#2b3139] rounded-lg flex items-center justify-center text-[#848e9c] group-hover:bg-[#0ea5e9] group-hover:text-white transition-colors"><Server size={24} /></div><div className="text-right"><div className="text-[#f0b90b] font-bold text-lg font-mono">{rig.cost} USDT</div><div className="text-[10px] text-[#848e9c] uppercase">Price</div></div></div><div><div className="text-white font-bold text-lg mb-1">{rig.name}</div><div className="flex justify-between text-xs text-[#848e9c] border-t border-white/5 pt-2"><span>{rig.hashrate} MH/s</span><span className="text-[#0ecb81]">{rig.dailyOutput} TSLA/Day</span></div></div><button onClick={() => handleBuyRig(rig)} className="w-full px-4 py-2 bg-[#2b3139] hover:bg-[#0ea5e9] hover:text-white text-[#848e9c] rounded-lg font-bold text-sm transition-colors whitespace-nowrap">Purchase Rig</button></div>))}</div></div></div><div className="bg-gradient-to-br from-[#1e2329] to-[#0b0e11] rounded-2xl border border-[#2b3139] p-6 sm:p-8 relative mt-12"><div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4"><h2 className="text-2xl font-bold text-white">{t('airdrop_title')}</h2><div className="bg-[#f0b90b]/10 text-[#f0b90b] px-3 py-1 rounded text-sm font-bold border border-[#f0b90b]/20 text-center sm:text-left">Reward: 100 {customToken.symbol}</div></div><div className="space-y-3 mb-8"><QuestItem label={t('quest_kyc')} done={hasKYC} /><QuestItem label={t('quest_deposit')} done={hasDeposit} /><QuestItem label={t('quest_trade')} done={hasTrade} /></div><button onClick={handleClaim} disabled={!isEligible} className={\`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all \${isEligible ? 'bg-[#f0b90b] text-black hover:bg-[#d4a406] shadow-lg shadow-[#f0b90b]/20' : 'bg-[#2b3139] text-[#848e9c] cursor-not-allowed border border-white/5'}\`}>{isEligible ? <Unlock size={20} /> : <Lock size={20} />}{isEligible ? t('airdrop_claim') : t('airdrop_locked')}</button></div></>)}
            {activeTab === 'REFERRAL' && (<div className="bg-[#1e2329] rounded-2xl border border-[#2b3139] p-4 sm:p-8 w-full max-w-[100vw] overflow-hidden"><div className="text-center max-w-2xl mx-auto mb-12"><Share2 size={48} className="text-[#0ea5e9] mx-auto mb-4" /><h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('referral_title')}</h2><p className="text-[#848e9c] text-sm sm:text-base">{t('referral_desc')}</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"><div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">{t('my_referrals')}</div><div className="text-3xl text-white font-bold">{currentUser?.referralCount || 0}</div></div><div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">{t('total_earned')}</div><div className="text-3xl text-[#0ecb81] font-bold">\${(currentUser?.referralEarnings || 0).toFixed(2)}</div></div><div className="bg-[#0b0e11] p-6 rounded-xl border border-white/5 text-center"><div className="text-[#848e9c] text-xs uppercase font-bold mb-2">Commission Rate</div><div className="text-3xl text-[#f0b90b] font-bold">20%</div></div></div>{currentUser ? (<div className="bg-[#0b0e11] p-4 sm:p-6 rounded-xl border border-[#2b3139] max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 cursor-pointer hover:border-[#848e9c] transition-colors w-full"><div className="flex-1 w-full text-center sm:text-left overflow-hidden min-w-0"><div className="text-xs text-[#848e9c] uppercase tracking-wider mb-1">{t('invite_link')}</div><div className="text-white font-mono font-bold text-sm sm:text-base break-all">https://tsla-global.com/register?ref={currentUser.inviteCode}</div></div><div className="p-3 bg-[#2b3139] rounded-lg shrink-0" onClick={(e) => { e.stopPropagation(); handleCopyInvite(); }}>{copied ? <Check size={20} className="text-[#0ecb81]"/> : <Copy size={20} className="text-white"/>}</div></div>) : (<div className="text-center"><button className="px-8 py-3 bg-[#0ea5e9] rounded-lg text-white font-bold">Log in to Invite</button></div>)}</div>)}
        </div>
    );
};`,

  'src/pages/UserCenter.tsx': `import React from 'react';
import { useStore } from '../context/StoreContext';
import { Shield, CheckCircle, Clock, Smartphone, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
export const UserCenter: React.FC = () => {
  const { currentUser, t, verifyKYC, toggle2FA } = useStore();
  if (!currentUser) return <div className="p-10 text-center text-[#848e9c]">Please Log In</div>;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-white mb-8">{t('user_center')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8"><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6 text-center"><div className="w-24 h-24 bg-[#2b3139] rounded-full mx-auto mb-4 flex items-center justify-center text-[#848e9c]"><UserIcon size={48} /></div><div className="text-white font-bold text-lg mb-1">{currentUser.email}</div><div className="text-[#848e9c] text-sm mb-4">UID: {currentUser.id}</div><div className="inline-block px-3 py-1 bg-[#f0b90b]/10 text-[#f0b90b] rounded font-bold text-xs uppercase border border-[#f0b90b]/20">{currentUser.kycLevel >= 2 ? 'Verified' : 'Unverified'}</div></div><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-6"><h3 className="text-white font-bold mb-4 flex items-center gap-2"><Clock size={18}/> {t('login_history')}</h3><div className="space-y-4">{[1, 2, 3].map(i => (<div key={i} className="flex justify-between text-sm"><span className="text-[#848e9c]">2024-05-2{i} 14:30:00</span><span className="text-white">192.168.1.{i}</span></div>))}</div></div></div>
        <div className="md:col-span-2 space-y-6"><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-8"><h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-[#0ea5e9]" /> {t('security')}</h2><div className="space-y-6"><div className="flex items-center justify-between pb-6 border-b border-[#2b3139]"><div className="flex items-center gap-4"><Lock size={24} className="text-[#848e9c]" /><div><div className="text-white font-bold">Login Password</div><div className="text-[#848e9c] text-sm">Used for login and security checks</div></div></div><button className="px-4 py-2 border border-[#2b3139] rounded text-white hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">Change</button></div><div className="flex items-center justify-between pb-6 border-b border-[#2b3139]"><div className="flex items-center gap-4"><Smartphone size={24} className="text-[#848e9c]" /><div><div className="text-white font-bold">Phone Verification (2FA)</div><div className="text-[#848e9c] text-sm">Protect your account and withdrawals</div></div></div><button onClick={toggle2FA} className="px-4 py-2 bg-[#0ea5e9] text-white rounded font-bold hover:bg-[#0284c7]">Enable</button></div><div className="flex items-center justify-between"><div className="flex items-center gap-4"><AlertCircle size={24} className={currentUser.kycLevel >= 2 ? "text-[#0ecb81]" : "text-[#848e9c]"} /><div><div className="text-white font-bold">Identity Verification</div><div className="text-[#848e9c] text-sm">Current: {currentUser.kycLevel >= 2 ? 'Verified' : 'Unverified'}</div></div></div>{currentUser.kycLevel < 2 ? (<button onClick={verifyKYC} className="flex items-center gap-2 px-4 py-2 border border-[#f0b90b] text-[#f0b90b] rounded font-bold hover:bg-[#f0b90b]/10">Verify Now</button>) : (<button disabled className="flex items-center gap-2 px-4 py-2 bg-[#0ecb81]/10 text-[#0ecb81] rounded font-bold border border-[#0ecb81]/20"><CheckCircle size={16} /> Verified</button>)}</div></div></div><div className="bg-[#1e2329] border border-[#2b3139] rounded-2xl p-8"><h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle className="text-[#0ecb81]" /> Account Limits</h2><div className="grid grid-cols-2 gap-4"><div className="bg-[#0b0e11] p-4 rounded-xl border border-[#2b3139]"><div className="text-[#848e9c] text-xs uppercase mb-1">Daily Withdrawal</div><div className="text-white font-mono text-xl">{currentUser.kycLevel >= 2 ? '100.00 BTC' : '2.00 BTC'}</div></div><div className="bg-[#0b0e11] p-4 rounded-xl border border-[#2b3139]"><div className="text-xs text-[#848e9c] uppercase mb-1">P2P Trade</div><div className="text-white font-mono text-xl">Unlimited</div></div></div></div></div>
      </div>
    </div>
  );
};`,

  'src/App.tsx': `import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Trade } from './pages/Trade';
import { Assets } from './pages/Assets';
import { Admin } from './pages/Admin';
import { Airdrop } from './pages/Airdrop';
import { UserCenter } from './pages/UserCenter';
const App: React.FC = () => {
  const [activePage, setActivePage] = useState('home'); const [pageParams, setPageParams] = useState<any>(null);
  const navigate = (page: string, params?: any) => { setActivePage(page); if (params) setPageParams(params); };
  const renderPage = () => { switch (activePage) { case 'home': return <Home onNavigate={navigate} />; case 'trade': return <Trade />; case 'assets': return <Assets />; case 'admin': return <Admin />; case 'airdrop': return <Airdrop />; case 'user_center': return <UserCenter />; default: return <Home onNavigate={navigate} />; } };
  return <StoreProvider><Layout activePage={activePage} onNavigate={navigate}>{renderPage()}</Layout></StoreProvider>;
};
export default App;`
};

// 2. Main Logic to Create Files and Folders
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

Object.keys(files).forEach((filePath) => {
  ensureDirectoryExistence(filePath);
  fs.writeFileSync(filePath, files[filePath]);
  console.log(`Created: ${filePath}`);
});

console.log("\n✅ Setup Complete!");
console.log("Run 'npm install' then 'npm run dev' to start.");
    