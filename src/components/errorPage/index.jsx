import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import Button from '../common/button';
import ErrorLottie from './errorLottie';
import { useErrorAnimation } from './useErrorAnimation';
import { lottiePaletteToCssVars, pickLottiePalette } from '../../utils/lottieColors';
import './index.scss';

const DEFAULT_ACTIONS = [{ label: 'Về Trang Chủ', to: '/', variant: 'accent' }];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function ErrorPage({
  code,
  tagline,
  title,
  description,
  illustration,
  animationData,
  animationSrc,
  actions = DEFAULT_ACTIONS,
  className = '',
  layout = 'stack',
  showCode = true,
}) {
  const isLight = layout === 'light';
  const { animationData: resolvedAnimation, loading } = useErrorAnimation({
    animationData,
    animationSrc,
  });

  const themeStyle = useMemo(() => {
    const palette = pickLottiePalette(resolvedAnimation);
    return lottiePaletteToCssVars(palette);
  }, [resolvedAnimation]);

  const artContent = resolvedAnimation ? (
    <ErrorLottie animationData={resolvedAnimation} />
  ) : loading ? (
    <div className="error-page__art-placeholder" aria-hidden="true" />
  ) : (
    illustration
  );

  return (
    <div
      className={`error-page ${className} error-page--layout-${layout}`.trim()}
      style={themeStyle}
    >
      <div className="error-page__glow error-page__glow--primary" aria-hidden="true" />
      <div className="error-page__glow error-page__glow--secondary" aria-hidden="true" />

      <motion.div
        className="error-page__inner"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {isLight && showCode && (
          <motion.span className="error-page__watermark" variants={fadeUp} aria-hidden="true">
            {code}
          </motion.span>
        )}

        {showCode && !isLight && (
          <motion.h1 className="error-page__code" variants={fadeUp}>
            {code}
          </motion.h1>
        )}

        {tagline && (
          <motion.p className="error-page__tagline" variants={fadeUp}>
            {tagline}
          </motion.p>
        )}

        <motion.div className="error-page__art" variants={fadeUp}>
          {resolvedAnimation || loading ? (
            artContent
          ) : (
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {artContent}
            </motion.div>
          )}
        </motion.div>

        <motion.h2 className="error-page__title" variants={fadeUp}>
          {title}
        </motion.h2>
        <motion.p className="error-page__description" variants={fadeUp}>
          {description}
        </motion.p>

        <motion.div className="error-page__actions" variants={fadeUp}>
          {actions.map((action) => {
            const variant = action.variant || 'accent';
            const key = `${action.label}-${action.to || 'action'}`;

            if (action.to) {
              return (
                <Link key={key} to={action.to} className="error-page__action-link">
                  <Button variant={variant}>{action.label}</Button>
                </Link>
              );
            }

            return (
              <Button key={key} variant={variant} onClick={action.onClick}>
                {action.label}
              </Button>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
