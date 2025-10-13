import React from 'react';
import { Avatar as MuiAvatar, Badge as MuiBadge } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledAvatar = styled(MuiAvatar)(({ theme, size = 'medium' }) => ({
  ...(size === 'small' && {
    width: 24,
    height: 24,
    fontSize: '0.75rem',
  }),
  ...(size === 'medium' && {
    width: 40,
    height: 40,
    fontSize: '1rem',
  }),
  ...(size === 'large' && {
    width: 56,
    height: 56,
    fontSize: '1.25rem',
  }),
  ...(size === 'xlarge' && {
    width: 72,
    height: 72,
    fontSize: '1.5rem',
  }),
}));

const StyledBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error?.main || '#B3261E',
    color: theme.palette.error.contrastText,
    borderRadius: 10,
  },
}));

const Avatar = ({
  src,
  alt,
  children,
  size = 'medium',
  badge,
  badgeContent,
  ...props
}) => {
  const avatar = (
    <StyledAvatar
      src={src}
      alt={alt}
      size={size}
      {...props}
    >
      {children}
    </StyledAvatar>
  );

  if (badge || badgeContent) {
    return (
      <StyledBadge
        badgeContent={badgeContent}
        invisible={!badgeContent}
        {...badge}
      >
        {avatar}
      </StyledBadge>
    );
  }

  return avatar;
};

export default Avatar;