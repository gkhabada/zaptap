import Vue from 'vue';
import Router from 'vue-router';
import { user, redirectIfUnauthorized, userRoles } from './helpers/authorization';

Vue.use(Router);

const Landing = () => import('@/pages/Landing/Landing');
const BuyerRequest = () => import('@/pages/BuyerRequest/BuyerRequest');
const BuyerAnswers = () => import('@/pages/BuyerAnswers/BuyerAnswers');
const BuyerOrders = () => import('@/pages/BuyerOrders/BuyerOrders');
const SellerStock = () => import('@/pages/SellerStock/SellerStock');
const SellerRequests = () => import('@/pages/SellerRequests/SellerRequests');
const SellerOrders = () => import('@/pages/SellerOrders/SellerOrders');
const Profile = () => import('@/pages/Profile');
const ChangePassword = () => import('@/pages/ChangePassword');

// const AuthGuard = (to, from, next) => {
//   const { token } = user;
//   if (!token) {
//     next('/auth');
//   } else {
//     next();
//   }
// };

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Landing',
      component: Landing,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/buyer/request',
      name: 'BuyerRequest',
      component: BuyerRequest,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/buyer/answers',
      name: 'BuyerAnswers',
      component: BuyerAnswers,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/buyer/orders',
      name: 'BuyerOrders',
      component: BuyerOrders,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/seller/stock',
      name: 'SellerStock',
      component: SellerStock,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/seller/requests',
      name: 'SellerRequests',
      component: SellerRequests,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/seller/orders',
      name: 'SellerOrders',
      component: SellerOrders,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      // beforeEnter: AuthGuard,
    },
    {
      path: '/changepassword',
      name: 'ChangePassword',
      component: ChangePassword,
    },
    {
      path: '/validate/:token/:refresh',
      name: 'Validate',
    },
    {
      path: '/policy',
      name: 'Policy',
      component: () => import('@/pages/Policy'),
    },
    {
      path: '/contract',
      name: 'Contract',
      component: () => import('@/pages/Contract'),
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/pages/NotFound'),
    },
    {
      path: '/widget',
      name: 'Widget',
      component: () => import('@/pages/Widget/Widget'),
    },
    {
      path: '*',
      redirect: 'Landing',
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if(to.name !== 'Validate' && to.name !== 'Widget') {
      console.log(user.token);
      console.log(user.rolesLoaded);
    let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    while (!!user.token && !user.rolesLoaded) {
      await timeout(50);
    }

    redirectIfUnauthorized();
  }

  ym(51216455, 'hit', to.fullPath);

  if(to.path === '/' && !user.is_buyer) {
      console.log(to.name);
      console.log(user);
    next({name: 'SellerRequests'}); return;
  }
  else if(['BuyerRequest', 'BuyerAnswers', 'BuyerOrders'].includes(to.name) && !user.is_buyer) {
    console.log(to.name);
    console.log(user);
    // next({name: 'Landing'}); return;
  }
  else if(['SellerStock', 'SellerRequests', 'SellerOrders'].includes(to.name) && !user.is_seller) {
    console.log(to.name);
    console.log(user);
    // next({name: 'Landing'}); return;
  }

  next();
});

export default router;
