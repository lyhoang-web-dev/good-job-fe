import { Box, Button, Input } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { queryKeys } from '@/lib/services/queryKeys';
import { usersService } from '@/lib/services/users';
import type { RecipientSelection } from '@/lib/types';

type RecipientSearchProps = {
  excludeId?: string;
  selectedId: string;
  onSelect: (user: RecipientSelection) => void;
  onBlur: () => void;
  isEnabled: boolean;
};

export function RecipientSearch({
  excludeId,
  selectedId,
  onSelect,
  onBlur,
  isEnabled,
}: RecipientSearchProps) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users.search(debounced),
    queryFn: () => usersService.getUsers(debounced || undefined),
    enabled: isEnabled,
  });

  const filtered = users.filter((u) => u.id !== excludeId);

  function handleSelect(user: RecipientSelection) {
    isSelectingRef.current = false;
    setSearch(user.name);
    setShowDropdown(false);
    onSelect(user);
  }

  return (
    <Box position="relative" ref={containerRef} width="100%">
      <Input
        onBlur={() => {
          if (!isSelectingRef.current) {
            onBlur();
          }
        }}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!e.target.value) {
            onSelect({ id: '', name: '' });
          }
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        placeholder="🔍 Search colleague…"
        value={search}
      />

      {showDropdown && filtered.length > 0 && (
        <Box
          bg="surface.elevated"
          borderRadius="12px"
          borderWidth="1px"
          boxShadow="md"
          left={0}
          maxHeight="160px"
          overflowY="auto"
          position="absolute"
          right={0}
          top="calc(100% + 4px)"
          zIndex={10}
        >
          {filtered.map((u) => (
            <Button
              justifyContent="flex-start"
              key={u.id}
              onClick={() => handleSelect({ id: u.id, name: u.name })}
              onMouseDown={() => {
                isSelectingRef.current = true;
              }}
              size="sm"
              type="button"
              variant={selectedId === u.id ? 'subtle' : 'ghost'}
              width="100%"
            >
              {u.name}
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
