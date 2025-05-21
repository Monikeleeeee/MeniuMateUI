import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Paper,
} from '@mui/material';

type MemberDTO = {
  id: number;
  name: string;
};

type GroupDetailDTO = {
  id: number;
  title: string;
  members: MemberDTO[];
};

type SplitType = 'Equal' | 'Percentage' | 'Dynamic';

const SplitTypes = {
  Equal: 'Equal' as SplitType,
  Percentage: 'Percentage' as SplitType,
  Dynamic: 'Dynamic' as SplitType,
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

const steps = ['Payer & Amount', 'Split Options', 'Review & Submit'];

const CreateTransactionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  if (!id) return <Typography>Invalid group ID.</Typography>;

  const { data: group, error } = useSWR<GroupDetailDTO>(
    `http://localhost:5131/api/Group/${id}`,
    fetcher
  );

  const [activeStep, setActiveStep] = useState(0);

  const [payerId, setPayerId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>(SplitTypes.Equal);
  const [percentages, setPercentages] = useState<{ [memberId: number]: string }>({});
  const [dynamicAmounts, setDynamicAmounts] = useState<{ [memberId: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (error) return <Typography color="error">Error loading group data.</Typography>;
  if (!group) return (
    <Box textAlign="center" mt={5}>
      <CircularProgress />
    </Box>
  );

  const handleInputChange = (
    memberId: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<{ [memberId: number]: string }>>
  ) => {
    if (!/^\d*\.?\d*$/.test(value.trim())) return;
    setter(prev => ({ ...prev, [memberId]: value }));
  };

  const splitTypeMap: Record<SplitType, number> = {
    Equal: 0,
    Percentage: 1,
    Dynamic: 2,
  };

  const handleNext = () => {
    setErrorMsg('');
    if (activeStep === 0) {
      if (!payerId) {
        setErrorMsg('Please select who paid.');
        return;
      }
      const parsedAmount = parseFloat(amount.trim());
      if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrorMsg('Please enter a valid amount.');
        return;
      }
    } else if (activeStep === 1) {
      const parsedAmount = parseFloat(amount.trim());
      if (splitType === SplitTypes.Percentage) {
        const totalPercent = group.members.reduce(
          (sum, m) => sum + (parseFloat((percentages[m.id] || '0').trim()) || 0),
          0
        );
        if (Math.abs(totalPercent - 100) > 0.01) {
          setErrorMsg('Percentages must sum to 100%.');
          return;
        }
      } else if (splitType === SplitTypes.Dynamic) {
        const totalDynamic = group.members.reduce(
          (sum, m) => sum + (parseFloat((dynamicAmounts[m.id] || '0').trim()) || 0),
          0
        );
        if (Math.abs(totalDynamic - parsedAmount) > 0.01) {
          setErrorMsg('Dynamic amounts must sum to total amount.');
          return;
        }
      }
    }
    setErrorMsg('');
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setErrorMsg('');
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount.trim());
      let splits: { memberId: number; value: number }[] = [];

      if (splitType === SplitTypes.Equal) {
        const splitAmount = parsedAmount / group.members.length;
        splits = group.members.map(m => ({ memberId: m.id, value: splitAmount }));
      } else if (splitType === SplitTypes.Percentage) {
        splits = group.members.map(m => ({
          memberId: m.id,
          value: ((parseFloat((percentages[m.id] || '0').trim()) || 0) / 100) * parsedAmount,
        }));
      } else if (splitType === SplitTypes.Dynamic) {
        splits = group.members.map(m => ({
          memberId: m.id,
          value: parseFloat((dynamicAmounts[m.id] || '0').trim()) || 0,
        }));
      }

      const res = await fetch(`http://localhost:5131/api/Transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: Number(id),
          payerId,
          totalAmount: parsedAmount,
          splitType: splitTypeMap[splitType],
          splits,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create transaction.');
      }

      navigate(`/group/${id}`, {
        state: { refreshTrigger: (location.state?.refreshTrigger ?? 0) + 1 },
      });
    } catch (err) {
      setErrorMsg((err as Error).message);
      setActiveStep(2); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto" mt={5} p={2}>
      <Typography variant="h4" align="center" mb={4}>
        Create Transaction for "{group.title}"
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {activeStep === 0 && (
            <Stack spacing={3}>
              <TextField
                select
                label="Payer"
                value={payerId}
                onChange={e => setPayerId(Number(e.target.value))}
                disabled={loading}
                fullWidth
              >
                <MenuItem value="">Select payer</MenuItem>
                {group.members.map(m => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Amount"
                value={amount}
                onChange={e => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value);
                }}
                disabled={loading}
                fullWidth
              />
            </Stack>
          )}

          {activeStep === 1 && (
            <>
              <TextField
                select
                label="Split Type"
                value={splitType}
                onChange={e => setSplitType(e.target.value as SplitType)}
                disabled={loading}
                fullWidth
                sx={{ mb: 3 }}
              >
                <MenuItem value={SplitTypes.Equal}>Equal</MenuItem>
                <MenuItem value={SplitTypes.Percentage}>Percentage</MenuItem>
                <MenuItem value={SplitTypes.Dynamic}>Dynamic</MenuItem>
              </TextField>

              {splitType === SplitTypes.Percentage && (
                <Stack spacing={2}>
                  <Typography>Enter percentage per member (must sum to 100%)</Typography>
                  {group.members.map(m => (
                    <TextField
                      key={m.id}
                      label={m.name}
                      value={percentages[m.id] || ''}
                      onChange={e => handleInputChange(m.id, e.target.value, setPercentages)}
                      disabled={loading}
                      fullWidth
                      InputProps={{
                        endAdornment: <Typography sx={{ mr: 1 }}>%</Typography>,
                      }}
                    />
                  ))}
                </Stack>
              )}

              {splitType === SplitTypes.Dynamic && (
                <Stack spacing={2}>
                  <Typography>Enter amount per member (must sum to total amount)</Typography>
                  {group.members.map(m => (
                    <TextField
                      key={m.id}
                      label={m.name}
                      value={dynamicAmounts[m.id] || ''}
                      onChange={e => handleInputChange(m.id, e.target.value, setDynamicAmounts)}
                      disabled={loading}
                      fullWidth
                    />
                  ))}
                </Stack>
              )}
            </>
          )}

          {activeStep === 2 && (
  <Box>
    <Typography variant="h6" mb={2} align="center">
      Review Transaction
    </Typography>

    <Stack spacing={1} mb={3}>
      <Typography>
        <strong>Payer:</strong>{' '}
        {group.members.find(m => m.id === payerId)?.name || 'N/A'}
      </Typography>

      <Typography>
        <strong>Amount:</strong> ${parseFloat(amount).toFixed(2)}
      </Typography>

      <Typography>
        <strong>Split Type:</strong> {splitType}
      </Typography>
    </Stack>

    <Typography variant="subtitle1" gutterBottom>
      Splits:
    </Typography>

    <Stack spacing={1} sx={{ pl: 2 }}>
      {splitType === SplitTypes.Equal &&
        group.members.map(m => (
          <Box
            key={m.id}
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: '1px solid #ddd', pb: 0.5 }}
          >
            <Typography>{m.name}</Typography>
            <Typography>${(parseFloat(amount) / group.members.length).toFixed(2)}</Typography>
          </Box>
        ))}

      {splitType === SplitTypes.Percentage &&
        group.members.map(m => {
          const pct = parseFloat(percentages[m.id] || '0') || 0;
          const val = ((pct / 100) * parseFloat(amount)).toFixed(2);
          return (
            <Box
              key={m.id}
              display="flex"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid #ddd', pb: 0.5 }}
            >
              <Typography>{m.name}</Typography>
              <Typography>
                ${val} ({pct.toFixed(2)}%)
              </Typography>
            </Box>
          );
        })}

      {splitType === SplitTypes.Dynamic &&
        group.members.map(m => {
          const val = parseFloat(dynamicAmounts[m.id] || '0') || 0;
          return (
            <Box
              key={m.id}
              display="flex"
              justifyContent="space-between"
              sx={{ borderBottom: '1px solid #ddd', pb: 0.5 }}
            >
              <Typography>{m.name}</Typography>
              <Typography>${val.toFixed(2)}</Typography>
            </Box>
          );
        })}
          </Stack>
        </Box>
      )}


          <Stack direction="row" spacing={2} mt={4} justifyContent="flex-end">
            {activeStep > 0 && (
              <Button onClick={handleBack} disabled={loading}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 && (
              <Button variant="contained" onClick={handleNext} disabled={loading}>
                Next
              </Button>
            )}
            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Create Transaction
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateTransactionPage;
