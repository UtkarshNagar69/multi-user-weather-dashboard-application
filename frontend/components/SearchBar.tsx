'use client';
import { useState, useRef, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { dashboardApi } from '@/lib/api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const addMutation = useMutation({
    mutationFn: (cityName: string) => dashboardApi.addCity(cityName),
    onSuccess: (data) => {
      toast.success(data.message);
      setQuery('');
      inputRef.current?.focus();
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addMutation.mutate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '500px' }}>
      <div style={{
        flex: 1,
        borderRadius: 'var(--radius-md)',
        transition: 'box-shadow 0.3s ease',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.1), 0 0 24px rgba(99,102,241,0.06)' : 'none',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          fontSize: '0.9rem', pointerEvents: 'none', opacity: 0.4, zIndex: 1,
        }}>🔍</span>
        <input
          id="city-search-input"
          ref={inputRef}
          type="text"
          className="input-glass"
          style={{ paddingLeft: '40px' }}
          placeholder="Search city — London, Tokyo, Mumbai…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={addMutation.isPending}
          autoComplete="off"
        />
      </div>
      <button
        id="city-search-submit"
        type="submit"
        className="btn-primary"
        style={{ width: 'auto', padding: '13px 24px', whiteSpace: 'nowrap', flexShrink: 0 }}
        disabled={addMutation.isPending || !query.trim()}
      >
        {addMutation.isPending ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="spinner spinner-sm" />
            Adding…
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 300 }}>+</span>
            Add City
          </span>
        )}
      </button>
    </form>
  );
}
