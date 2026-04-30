import Router from 'koa-router'
import * as authController from '../controllers/authController'
import * as productController from '../controllers/productController'
import * as categoryController from '../controllers/categoryController'
import * as orderController from '../controllers/orderController'
import * as userController from '../controllers/userController'
import * as adminController from '../controllers/adminController'
import { authMiddleware, adminMiddleware } from '../middleware/auth'

const router = new Router({ prefix: '/api' })

router.post('/auth/login', authController.login)
router.post('/admin/auth/login', authController.adminLogin)

router.use(authMiddleware)

router.get('/auth/profile', authController.getProfile)
router.put('/auth/profile', authController.updateProfile)

router.get('/products', productController.getProducts)
router.get('/products/:id', productController.getProduct)

router.get('/categories', categoryController.getCategories)

router.get('/orders', orderController.getOrders)
router.get('/orders/:id', orderController.getOrder)
router.post('/orders', orderController.createOrder)
router.post('/orders/:id/cancel', orderController.cancelOrder)
router.post('/orders/:id/after-sale', orderController.applyAfterSale)

router.use(adminMiddleware)

router.post('/products', productController.createProduct)
router.put('/products/:id', productController.updateProduct)
router.delete('/products/:id', productController.deleteProduct)
router.patch('/products/:id/status', productController.toggleStatus)

router.post('/categories', categoryController.createCategory)
router.put('/categories/:id', categoryController.updateCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

router.patch('/orders/:id/status', orderController.updateOrderStatus)

router.get('/admin/users', userController.getUsers)
router.post('/admin/users', userController.createUser)
router.put('/admin/users/:id', userController.updateUser)
router.delete('/admin/users/:id', userController.deleteUser)

router.get('/admin/statistics/dashboard', adminController.getDashboard)
router.get('/admin/statistics/sales', adminController.getSales)
router.get('/admin/logs', adminController.getLogs)

export default router
