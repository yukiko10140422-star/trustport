'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1
          className="text-2xl sm:text-3xl tracking-[0.3em] mb-8"
          style={{ fontFamily: 'var(--font-serif-jp)' }}
        >
          CART
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p
              className="text-5xl text-[var(--color-nezumi)] opacity-20 mb-4"
              style={{ fontFamily: 'var(--font-serif-jp)' }}
            >
              空
            </p>
            <p className="text-sm text-[var(--color-nezumi)] mb-6">カートは空です</p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 bg-[var(--color-shinku)] text-sm tracking-wider hover:bg-[var(--color-shinku-light)] transition-colors"
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <>
            {/* カートアイテム一覧 */}
            <div className="flex flex-col gap-6 mb-12">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-6 pb-6 border-b border-white/5"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[var(--color-sumi)] flex items-center justify-center shrink-0 border border-white/5">
                    <span
                      className="text-2xl text-[var(--color-nezumi)] opacity-30"
                      style={{ fontFamily: 'var(--font-serif-jp)' }}
                    >
                      {item.product.name.charAt(0)}
                    </span>
                  </div>

                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm sm:text-base font-medium hover:text-[var(--color-kin)] transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-[var(--color-nezumi)] mt-1">
                      サイズ: {item.size}
                    </p>
                    <p
                      className="text-sm text-[var(--color-kin)] mt-2"
                      style={{ fontFamily: 'var(--font-serif-jp)' }}
                    >
                      {formatPrice(item.product.price)}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        type="button"
                        className="w-8 h-8 border border-white/10 flex items-center justify-center text-sm hover:border-[var(--color-shinku)] transition-colors"
                        onClick={() =>
                          updateQuantity(item.product.id, item.size, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        className="w-8 h-8 border border-white/10 flex items-center justify-center text-sm hover:border-[var(--color-shinku)] transition-colors"
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

                  <div className="hidden sm:block text-right">
                    <span
                      className="text-sm text-[var(--color-kin)]"
                      style={{ fontFamily: 'var(--font-serif-jp)' }}
                    >
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* サマリー */}
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-nezumi)]">小計</span>
                <span
                  className="text-xl text-[var(--color-kin)]"
                  style={{ fontFamily: 'var(--font-serif-jp)' }}
                >
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <p className="text-xs text-[var(--color-nezumi)] mb-6">
                ※ 送料は購入手続き時に計算されます
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="flex-1 py-4 bg-[var(--color-shinku)] text-sm tracking-[0.2em] hover:bg-[var(--color-shinku-light)] transition-colors"
                >
                  購入手続きへ
                </button>
                <button
                  type="button"
                  className="py-4 px-6 border border-white/10 text-sm text-[var(--color-nezumi)] hover:border-[var(--color-shinku)] hover:text-[var(--color-shinku)] transition-colors"
                  onClick={clearCart}
                >
                  カートを空にする
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
