import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/official-account',
    component: Layout,
    redirect: '/official-account/index',
    name: 'Official',
    meta: {
      title: '公众号管理',
      icon: 'table'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/official-account/official-list'),
        name: 'Official-List',
        meta: { title: '公众号列表' }
      },
      {
        path: 'send_template/:appid(\\w+)',
        component: () => import('@/views/message/create'),
        name: 'SendTemplate',
        meta: { title: '发送模板消息', noCache: true, activeMenu: '/official-list/index' },
        hidden: true
      },
      {
        path: 'create',
        component: () => import('@/views/official-account/create'),
        name: 'CreateOfficial',
        meta: { title: '添加公众号', noCache: true, activeMenu: '/official-list/index' },
        hidden: true
      },
      {
        path: 'stats',
        component: () => import('@/views/official-account/official-user-daily-stats'),
        name: 'Official-User-Daily-Stats',
        meta: { title: '每日粉丝统计' }
      },
      {
        path: 'article',
        component: () => import('@/views/official-account/official-article-summary'),
        name: 'Official-User-Daily-Stats',
        meta: { title: '每日阅读统计' }
      },
      {
        path: 'ad',
        component: () => import('@/views/official-account/ad-scheduling'),
        name: 'Ad-Scheduling',
        meta: { title: '广告排期' }
      },
      {
        path: 'detail',
        component: () => import('@/views/official-account/ad-scheduling-detail'),
        name: 'Ad-Scheduling-Detail',
        meta: { title: '排期明细', noCache: true, activeMenu: '/official-account/ad' },
        hidden: true
      }
    ]
  },
  {
    path: '/official-balance',
    component: Layout,
    redirect: '/official-balance/total',
    name: 'OfficialBalance',
    meta: {
      title: '公众号收支',
      icon: 'money'
    },
    children: [
      {
        path: 'total',
        component: () => import('@/views/official-balance/month-stat-summary-list'),
        name: 'Month-Stat-Summary-List',
        meta: { title: '每月汇总' }
      },
      {
        path: 'index',
        component: () => import('@/views/official-balance/month-stat-list'),
        name: 'Month-Stat-List',
        meta: { title: '每月统计' }
      },
      {
        path: 'operation',
        component: () => import('@/views/official-balance/official-operation-list'),
        name: 'Month-Stat-List',
        meta: { title: '公众号运营' }
      },
      {
        path: 'vio',
        component: () => import('@/views/official-account/vio-record'),
        name: 'Vio',
        meta: { title: '违规记录' }
      },
      {
        path: 'create',
        component: () => import('@/views/official-account/create'),
        name: 'CreateOfficial',
        meta: { title: '添加收支明细', noCache: true, activeMenu: '/official-balance/index' },
        hidden: true
      },
      {
        path: 'detail/:official_balance_stat_id(\\d+)',
        component: () => import('@/views/official-balance/detail'),
        name: 'OfficialBalanceDetail',
        meta: { title: '收支明细', noCache: true, activeMenu: '/official-balance/index' },
        hidden: true
      }
    ]
  },
  {
    path: '/fans',
    component: Layout,
    redirect: '/fans/index',
    name: 'Fans',
    meta: {
      title: '粉丝管理',
      icon: 'people'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/fans/index'),
        name: 'Index',
        meta: { title: '粉丝列表' }
      },
      {
        path: 'stat',
        component: () => import('@/views/fans/stat'),
        name: 'Stat',
        meta: { title: '数据分析' }
      }
    ]
  },
  {
    path: '/template-message',
    component: Layout,
    redirect: '/template-message/index',
    name: 'Message',
    meta: {
      title: '消息管理',
      icon: 'message'
    },
    children: [
      {
        path: 'template',
        component: () => import('@/views/message/template-message-list'),
        name: 'Template-Message-List',
        meta: { title: '模板消息' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    name: 'User',
    meta: {
      title: '用户管理',
      icon: 'peoples'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/user/user-list'),
        name: 'User-List',
        meta: { title: '人员列表' }
      }
      // {
      //   path: 'role',
      //   component: () => import('@/views/role/index'),
      //   name: 'Role',
      //   meta: { title: '角色列表' }
      // }
    ]
  },
  {
    path: '/tool',
    component: Layout,
    redirect: '/tool/index',
    name: 'Tool',
    meta: {
      title: '工具',
      icon: 'skill'
    },
    children: [
      {
        path: 'index',
        component: () => import('@/views/tools/index'),
        name: 'Gif-Creator',
        meta: { title: 'GIF动图生成' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
