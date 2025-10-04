import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  to,
  ...props
}) => {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300';

  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-lg',
    glass: 'glass dark:glass-dark shadow-glass',
    elegant: 'card-elegant',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20',
  };

  const hoverStyles = hover ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';

  const classes = `${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
};

export default Card;
