# 牌见 · 广东麻将牌局助手

可部署到 Cloudflare 的静态网页。完整记录四人牌局，按可见信息计算下一摸自摸概率与固定听牌集合的多摸命中概率。白板作鬼，七对/十三幺/鸡胡可配置。**不是最终胜率或点炮预测器**。总牌数暂按136张解释。

## 本地开发

Node.js 22+，无需数据库或业务密钥。运行时不依赖第三方API。

```sh
npm ci --cache /tmp/maj-npm-cache
npm run dev
```

使用现有 checkout；每个云任务已经隔离，无需另建 worktree。默认开发端口5173，PORT可覆盖。所有牌局只保存在当前浏览器；导出JSON备份，跨设备可导入。请勿把手动编辑的文件当作已验证牌局，导入时会逐事件重放校验。

## 验证与构建

```sh
npm test
npm run validate
npm run build
npm run dev -- --dist
```

`validation/report.json` 是实际生成的合成统计；`validation/replay.json` 是168事件的完整四人摸舍示例，可从界面导入。`validation/winning-replay.json` 是含白板鬼自摸的短局示例。模拟不代表真实牌手数据。详细假设与研究来源见 [MODEL.md](docs/MODEL.md)，版本记录见 [CHANGELOG.md](docs/CHANGELOG.md)。

浏览器回归：

```sh
PLAYWRIGHT_BROWSERS_PATH=/tmp/maj-browsers npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=/tmp/maj-browsers npm run test:e2e
# 本云环境已有系统Chromium，也可直接使用：
CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e
```

## Cloudflare 部署

推荐 Workers Static Assets（免费静态资源托管路径，配置见wrangler.jsonc）：

```sh
npm ci
npm run build
npx wrangler login
npm run deploy
```

在已登录的终端执行；CI使用Cloudflare安全变量 `CLOUDFLARE_API_TOKEN`（限定本账号Worker的编辑权限）与 `CLOUDFLARE_ACCOUNT_ID`，不要提交密钥。`wrangler`需要可写的用户配置目录；受限云机器可用 `XDG_CONFIG_HOME=/tmp/maj-cloudflare-config`。未配置账号时可执行 `npm run deploy:check` 验证构建打包，无需假设已成功公网部署。

也可用Cloudflare Pages连接仓库，构建命令 `npm run build`，输出目录 `dist`，Node版本22或24。无需Functions、数据库、服务器或路由回退设置。

## 版本管理

本次实现保存为Git提交及本地v0.2.0标签；没有自动push远端。后续改公式先跑固定种子实验并保留旧模型对照，更新报告、测试和CHANGELOG后再升级版本。部署前跑test、validate、build及浏览器测试。项目CI自动验证并上传静态产物；生产部署由有授权的账号触发。
