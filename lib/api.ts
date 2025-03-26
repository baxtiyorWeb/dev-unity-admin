import axios from 'axios';

// Create axios instance
const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
	config => {
		// Get token from localStorage
		const token =
			typeof window !== 'undefined' ? localStorage.getItem('token') : null;

		// If token exists, add it to request headers
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
	response => {
		return response;
	},
	async error => {
		const originalRequest = error.config;

		// If error is 401 and we haven't tried to refresh token yet
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh token
				const refreshToken = localStorage.getItem('refreshToken');
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}

				const response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
					{
						refresh: refreshToken,
					}
				);

				// Save new tokens
				localStorage.setItem('token', response.data.access);

				// Retry original request with new token
				originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
				return api(originalRequest);
			} catch (refreshError) {
				// If refresh fails, redirect to login

				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

// Auth services
export const authService = {
	login: async (username: string, password: string) => {
		const response = await api.post('/auth/token/', { username, password });
		localStorage.setItem('token', response.data.access);
		localStorage.setItem('refreshToken', response.data.refresh);
		setTimeout(() => {
			window.location.href = '/';
		}, 500);
		return response.data;
	},
	verifyToken: async (token: string) => {
		return await api.post('/auth/token/verify/', { token });
	},
	getUsers: async () => {
		return await api.get('/auth/users/');
	},
};

// Projects services
export const projectsService = {
	getAll: async () => {
		return await api.get('/projects/');
	},
	getFeatured: async () => {
		return await api.get('/projects/featured/');
	},
	getById: async (id: string) => {
		return await api.get(`/projects/${id}/`);
	},
	create: async (data: any) => {
		return await api.post('/projects/', data);
	},
	update: async (id: string, data: any) => {
		return await api.put(`/projects/${id}/`, data);
	},
	partialUpdate: async (id: string, data: any) => {
		return await api.patch(`/projects/${id}/`, data);
	},
	delete: async (id: string) => {
		return await api.delete(`/projects/${id}/`);
	},
};

// Categories services
export const categoriesService = {
	getAll: async () => {
		return await api.get('/categories/');
	},
	getById: async (id: string) => {
		return await api.get(`/categories/${id}/`);
	},
	getProjects: async (id: string) => {
		return await api.get(`/categories/${id}/projects/`);
	},
	create: async (data: any) => {
		return await api.post('/categories/', data);
	},
	update: async (id: string, data: any) => {
		return await api.put(`/categories/${id}/`, data);
	},
	partialUpdate: async (id: string, data: any) => {
		return await api.patch(`/categories/${id}/`, data);
	},
	delete: async (id: string) => {
		return await api.delete(`/categories/${id}/`);
	},
};

// Project Images services
export const projectImagesService = {
	getAll: async () => {
		return await api.get('/project-images/');
	},
	getById: async (id: string) => {
		return await api.get(`/project-images/${id}/`);
	},
	create: async (data: any) => {
		return await api.post('/project-images/', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
	},
	update: async (id: string, data: any) => {
		return await api.put(`/project-images/${id}/`, data);
	},
	partialUpdate: async (id: string, data: any) => {
		return await api.patch(`/project-images/${id}/`, data);
	},
	delete: async (id: string) => {
		return await api.delete(`/project-images/${id}/`);
	},
};

// Pages services
export const pagesService = {
	getAll: async () => {
		return await api.get('/pages/');
	},
	getBySlug: async (slug: string) => {
		return await api.get(`/pages/${slug}/`);
	},
	getPublished: async (slug: string) => {
		return await api.get(`/pages/${slug}/published/`);
	},
	create: async (data: any) => {
		return await api.post('/pages/', data);
	},
	update: async (slug: string, data: any) => {
		return await api.put(`/pages/${slug}/`, data);
	},
	partialUpdate: async (slug: string, data: any) => {
		return await api.patch(`/pages/${slug}/`, data);
	},
	delete: async (slug: string) => {
		return await api.delete(`/pages/${slug}/`);
	},
};

// Navigation services
export const navigationService = {
	getAll: async () => {
		return await api.get('/navigation/');
	},
	getById: async (id: string) => {
		return await api.get(`/navigation/${id}/`);
	},
	create: async (data: any) => {
		return await api.post('/navigation/', data);
	},
	update: async (id: string, data: any) => {
		return await api.put(`/navigation/${id}/`, data);
	},
	partialUpdate: async (id: string, data: any) => {
		return await api.patch(`/navigation/${id}/`, data);
	},
	delete: async (id: string) => {
		return await api.delete(`/navigation/${id}/`);
	},
};

// Contact services
export const contactService = {
	create: async (data: any) => {
		return await api.post('/contact/', data);
	},
};

// Contact Submissions services (admin)
export const contactSubmissionsService = {
	getAll: async () => {
		return await api.get('/admin/contact-submissions/');
	},
	getById: async (id: string) => {
		return await api.get(`/admin/contact-submissions/${id}/`);
	},
	create: async (data: any) => {
		return await api.post('/admin/contact-submissions/', data);
	},
	update: async (id: string, data: any) => {
		return await api.put(`/admin/contact-submissions/${id}/`, data);
	},
	partialUpdate: async (id: string, data: any) => {
		return await api.patch(`/admin/contact-submissions/${id}/`, data);
	},
	delete: async (id: string) => {
		return await api.delete(`/admin/contact-submissions/${id}/`);
	},
	markAsRead: async (id: string) => {
		return await api.post(`/admin/contact-submissions/${id}/mark_as_read/`);
	},
};

export default api;
