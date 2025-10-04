import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = 'btn-base inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';

  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-purple-500/50 transform hover:-translate-y-1 active:translate-y-0 font-semibold',
    secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/50 transform hover:-translate-y-1 font-semibold',
    outline: 'border-2 border-gray-800 dark:border-gray-200 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-200 dark:hover:text-gray-900 focus:ring-4 focus:ring-gray-500/50 shadow-md hover:shadow-lg transform hover:-translate-y-1 font-semibold',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-4 focus:ring-gray-500/50 hover:shadow-md font-medium',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-red-500/50 transform hover:-translate-y-1 font-semibold',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-xl',
  };

  const classes = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
    </button>
  );
};

export default Button;
