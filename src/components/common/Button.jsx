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
    primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 hover:from-primary-700 hover:via-primary-600 hover:to-secondary-700 text-white shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 focus:ring-4 focus:ring-primary-500/50 transform hover:-translate-y-1 active:translate-y-0',
    secondary: 'bg-gradient-to-r from-secondary-600 to-accent-600 hover:from-secondary-700 hover:to-accent-700 text-white shadow-xl shadow-secondary-500/30 hover:shadow-2xl hover:shadow-secondary-500/40 focus:ring-4 focus:ring-secondary-500/50 transform hover:-translate-y-1',
    outline: 'border-2 border-primary-600 dark:border-primary-500 text-primary-700 dark:text-primary-400 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:bg-primary-600 hover:text-white hover:border-primary-600 dark:hover:bg-primary-600 dark:hover:border-primary-600 focus:ring-4 focus:ring-primary-500/50 shadow-md hover:shadow-xl transform hover:-translate-y-1',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-4 focus:ring-gray-500/50 hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 focus:ring-4 focus:ring-red-500/50 transform hover:-translate-y-1',
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
