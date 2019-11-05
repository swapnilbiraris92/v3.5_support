-- truncating data from precalculations tabale
truncate hmmasterdb.precalculations; 
truncate hmmasterdbcs.precalculations;

-- createing index on precalculation databases
create index precalculation_sa_index on hmmasterdb.precalculations (ts);
create index precalculation_cs_index on hmmasterdbcs.precalculations (ts);