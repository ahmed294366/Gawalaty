import { Clock, CheckCircle, XCircle, AlertCircle, } from "lucide-react";
export const getStatusColor = (status) => {
    const colors = {
        confirmed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        cancelled: 'bg-red-100 text-red-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return 'bg-red-100 text-red-800';
        case 'guide': return 'bg-green-100 text-green-800';
        case 'user': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const getStatusIcon = (status) => {
    const icons = {
        confirmed: CheckCircle,
        pending: Clock,
        cancelled: XCircle,
        rejected: AlertCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
};

export const getCategoryColor = (category) => {
    const colors = {
        safari: 'bg-orange-100 text-orange-800',
        historical: 'bg-amber-100 text-amber-800',
        culture: 'bg-indigo-100 text-indigo-800',
        "one-day": 'bg-yellow-100 text-yellow-800',
        medical: 'bg-red-100 text-red-800',
        family: 'bg-teal-100 text-teal-800',
        cruise: 'bg-sky-100 text-sky-800',
        adventure: 'bg-green-100 text-green-800',
        wildlife: 'bg-lime-100 text-lime-800',
        relaxation: 'bg-purple-100 text-purple-800'
    };
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
};