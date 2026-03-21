'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalPrice, removeItem, updateQuantity } = useCart();

  // カートトグルボタンのイベントをリッスン
  useEffect(() => {
    function handleCartToggle(e: Event) {
      const target = e.target as HTMLElement;
      if (target.closest('[data-cart-toggle]')) {
        setIsOpen((prev) => !prev);
      }
    }
    document.addEventListener('click', handleCartToggle);
    return () => document.removeEventListener('click', handleCartToggle);
  }, []);

  // カスタムイベントでオープン
  useEffect(() => {
    function handleOpen() {
      setIsOpen(true);
    }
    window.addEventListener('open-cart', handleOpen);
    return () => window.removeEventListener('open-cart', handleOpen);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* ドロワー */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[var(--color-sumi)] border-l border-white/5 flex flex-col"
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <h2
                className="text-lg tracking-[0.2em]"
                style={{ fontFamily: 'var(--font-serif-jp)' }}
              >
                CART
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-[var(--color-nezumi)] hover:text-[var(--color-shiro)] transition-colors"
                aria-label="カートを閉じる"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* カート内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <p
                    className="text-[var(--color-nezumi)] text-4xl opacity-30"
                    style={{ fontFamily: 'var(--font-serif-jp)' }}
                  >
                    空
                  </p>
                  <p className="text-sm text-[var(--color-nezumi)]">カートは空です</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="flex gap-4 pb-4 border-b border-white/5"
                    >
                      {/* 商品画像プレースホルダー */}
                      <div className="w-20 h-20 bg-[var(--color-hai)] flex items-center justify-center shrink-0">
                        <span
                          className="text-[var(--color-nezumi)] text-xs text-center px-1"
                          style={{ fontFamily: 'var(--font-serif-jp)' }}
                        >
                          {item.product.name.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-[var(--color-nezumi)] mt-1">
                          サイズ: {item.size}
                        </p>
                        <p className="text-sm text-[var(--color-kin)] mt-1">
                          {formatPrice(item.product.price)}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            className="w-7 h-7 border border-white/10 flex items-center justify-center text-xs hover:border-[var(--color-shinku)] transition-colors"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            className="w-7 h-7 border border-white/10 flex items-center justify-center text-xs hover:border-[var(--color-shinku)] transition-colors"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-auto text-xs text-[var(--color-nezumi)] hover:text-[var(--color-shinku)] transition-colors"
                            onClick={() => removeItem(item.product.id, item.size)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* フッター */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[var(--color-nezumi)]">小計</span>
                  <span
                    className="text-lg text-[var(--color-kin)]"
                    style={{ fontFamily: 'var(--font-serif-jp)' }}
                  >
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  className="block w-full py-3 bg-[var(--color-shinku)] text-center text-sm tracking-wider hover:bg-[var(--color-shinku-light)] transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  カートを見る
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
