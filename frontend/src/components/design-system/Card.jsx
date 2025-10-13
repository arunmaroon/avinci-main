import React from 'react';
import { Card as MuiCard, CardContent, CardActions, CardHeader as MuiCardHeader, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledCard = styled(MuiCard)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.30), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
}));

const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'medium',
  header,
  actions,
  media,
  ...props
}) => {
  const paddingMap = {
    none: 0,
    small: 2,
    medium: 3,
    large: 4,
  };

  const CardComponent = hover ? motion.div : 'div';
  const motionProps = hover ? {
    whileHover: { y: -2 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardComponent {...motionProps}>
      <StyledCard className={className} {...props}>
        {media && <CardMedia {...media} />}
        {header && <MuiCardHeader {...header} />}
        <CardContent sx={{ p: paddingMap[padding] }}>
          {children}
        </CardContent>
        {actions && <CardActions>{actions}</CardActions>}
      </StyledCard>
    </CardComponent>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <MuiCardHeader {...props} className={className}>
    {children}
  </MuiCardHeader>
);

const CardBody = ({ children, className = '', ...props }) => (
  <CardContent {...props} className={className}>
    {children}
  </CardContent>
);

const CardFooter = ({ children, className = '', ...props }) => (
  <CardActions {...props} className={className}>
    {children}
  </CardActions>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
