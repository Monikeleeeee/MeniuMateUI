import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { Button, Box } from '@mui/material';

type MemberDTO = {
  id: number;
  name: string;
};

type GroupDetailDTO = {
  id: number;
  title: string;
  members: MemberDTO[];
};

type DebtDTO = {
  fromMemberId: number;
  fromMemberName: string;
  toMemberId: number;
  toMemberName: string;
  amount: number;
};

type TransactionDTO = {
  id: number;
  payerName: string;
  totalAmount: number;
  date: string;
  splitType: string;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  if (!id) return <div>Invalid group ID.</div>;

  const [newMemberName, setNewMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [settlingPair, setSettlingPair] = useState<{ fromId: number; toId: number } | null>(null);

  const {
    data: group,
    error: groupError,
    mutate: mutateGroup,
  } = useSWR<GroupDetailDTO>(`http://localhost:5131/api/Group/${id}`, fetcher);

  const {
    data: debts,
    error: debtsError,
    mutate: mutateDebts,
  } = useSWR<DebtDTO[]>(`http://localhost:5131/api/GroupMembership/${id}/debts`, fetcher);

  const {
    data: transactions,
    error: transactionsError,
    mutate: mutateTransactions,
  } = useSWR<TransactionDTO[]>(`http://localhost:5131/api/GroupMembership/${id}/transactions`, fetcher);

  useEffect(() => {
    if (location.state && (location.state as any).refreshMatrix) {
      Promise.all([
        mutateGroup(undefined, { revalidate: true }),
        mutateDebts(undefined, { revalidate: true }),
        mutateTransactions(undefined, { revalidate: true }),
      ]).then(() => {
        window.history.replaceState({}, document.title);
      });
    }
  }, [location.state, mutateGroup, mutateDebts, mutateTransactions]);

  if (groupError || debtsError || transactionsError) return <div>Error loading data.</div>;
  if (!group || !debts || !transactions) return <div>Loading...</div>;

  const memberIndexMap = new Map<number, number>();
  group.members.forEach((m, i) => memberIndexMap.set(m.id, i));

  const matrix: number[][] = Array(group.members.length)
    .fill(0)
    .map(() => Array(group.members.length).fill(0));

  debts.forEach(({ fromMemberId, toMemberId, amount }) => {
    const fromIdx = memberIndexMap.get(fromMemberId);
    const toIdx = memberIndexMap.get(toMemberId);
    if (fromIdx !== undefined && toIdx !== undefined) {
      matrix[fromIdx][toIdx] = amount;
    }
  });

  const memberDebtInfo = new Map<number, { canRemove: boolean }>();
  group.members.forEach((member, i) => {
    let owes = false;
    let isOwed = false;
    for (let j = 0; j < group.members.length; j++) {
      if (i === j) continue;
      if (matrix[i][j] > 0) owes = true;
      if (matrix[j][i] > 0) isOwed = true;
    }
    memberDebtInfo.set(member.id, { canRemove: !owes && !isOwed });
  });

  const addMember = async () => {
    if (!newMemberName.trim()) {
      setErrorMsg('Name cannot be empty');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5131/api/Member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName: newMemberName.trim(), groupId: Number(id) }),
      });
      if (!res.ok) throw new Error('Failed to add member');

      setNewMemberName('');
      await mutateGroup(undefined, { revalidate: true });
      await mutateDebts(undefined, { revalidate: true });
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setRemovingMemberId(memberId);
    try {
      const res = await fetch(
        `http://localhost:5131/api/Member/groups/${id}/members/${memberId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to remove member');

      await mutateGroup(undefined, { revalidate: true });
      await mutateDebts(undefined, { revalidate: true });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setRemovingMemberId(null);
    }
  };

  const settleDebt = async (fromMemberId: number, toMemberId: number) => {
    setSettlingPair({ fromId: fromMemberId, toId: toMemberId });
    try {
      const res = await fetch(
        `http://localhost:5131/api/GroupMembership/${id}/settle?fromMemberId=${fromMemberId}&toMemberId=${toMemberId}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to settle debts');

      await mutateGroup(undefined, { revalidate: true });
      await mutateDebts(undefined, { revalidate: true });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSettlingPair(null);
    }
  };

  const goToCreateTransaction = () => {
    navigate(`/groups/${id}/transaction/new`, {
      state: { refreshMatrix: true },
    });
  };

  const minWidth = 400;
  const dynamicWidth = Math.max(minWidth, 250 + group.members.length * 130);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: 3,
        minHeight: 'auto',
      }}
    >
      <Box
        sx={{
          width: `${dynamicWidth}px`,
          backgroundColor: 'white',
          padding: 3,
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <h2 style={{ textAlign: 'center' }}>{group.title}</h2>

        <h3>Members of the group:</h3>
        {group.members.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              fontStyle: 'italic',
              color: 'gray',
              padding: 2,
            }}
          >
            This group doesn't have members yet!
          </Box>
        ) : (
          <table
            border={1}
            cellPadding={5}
            cellSpacing={0}
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
            }}
          >
            <thead>
              <tr>
                <th>Member</th>
                {group.members.map(m => (
                  <th key={m.id}>{m.name}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {group.members.map((rowMember, rowIdx) => {
                const debtsOwed = debts.filter(
                  d => d.fromMemberId === rowMember.id && d.amount > 0
                );
                return (
                  <tr key={rowMember.id}>
                    <td>
                      <strong>{rowMember.name}</strong>
                    </td>
                    {group.members.map((colMember, colIdx) => (
                      <td key={colMember.id}>
                        {rowIdx === colIdx ? '-' : matrix[rowIdx][colIdx].toFixed(2)}
                      </td>
                    ))}
                    <td>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {debtsOwed.map(debt => (
                          <Button
                            key={debt.toMemberId}
                            onClick={() =>
                              settleDebt(debt.fromMemberId, debt.toMemberId)
                            }
                            disabled={
                              settlingPair?.fromId === debt.fromMemberId &&
                              settlingPair?.toId === debt.toMemberId
                            }
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                          >
                            {settlingPair?.fromId === debt.fromMemberId &&
                            settlingPair?.toId === debt.toMemberId
                              ? 'Settling...'
                              : `Settle ${debt.toMemberName}`}
                          </Button>
                        ))}
                        {memberDebtInfo.get(rowMember.id)?.canRemove && (
                          <Button
                            onClick={() => removeMember(rowMember.id)}
                            disabled={removingMemberId === rowMember.id}
                            variant="contained"
                            color="error"
                            size="small"
                            sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                          >
                            {removingMemberId === rowMember.id
                              ? 'Removing...'
                              : 'Remove Member'}
                          </Button>
                        )}
                      </Box>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            onClick={goToCreateTransaction}
            variant="contained"
            color="primary"
            sx={{ fontSize: 16, textTransform: 'none', minWidth: '200px' }}
          >
            Create New Transaction
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
          <input
            type="text"
            placeholder="New member name"
            value={newMemberName}
            onChange={e => setNewMemberName(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: 16,
              borderRadius: 4,
              border: '1px solid #ccc',
              width: '200px',
              textAlign: 'center',
            }}
            disabled={loading}
          />
          <Button
            onClick={addMember}
            disabled={loading}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none', minWidth: '100px' }}
          >
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </Box>
        {errorMsg && (
          <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        <Box sx={{ mt: 5 }}>
          <h3>Transactions</h3>
          {transactions.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                fontStyle: 'italic',
                color: 'gray',
                padding: 2,
              }}
            >
              No transaction happened yet.
            </Box>
          ) : (
            <table
              border={1}
              cellPadding={5}
              cellSpacing={0}
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'center',
              }}
            >
              <thead>
                <tr>
                  <th>Payer</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Split Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.payerName}</td>
                    <td>{t.totalAmount.toFixed(2)}</td>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td>{t.splitType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </Box>
      
    </Box>
  );
};

export default GroupDetailPage;
