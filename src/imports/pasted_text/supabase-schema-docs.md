Arquitetura principal
App.tsx

Usa AppProvider para contexto global.
Renderiza AppNavigator.
AppContext.tsx

Contém o estado global e a lógica do app.
Carrega dados do Supabase (getRequests, getTimeSlots).
Mantém:
products
barbers
requests
timeSlots
bookingDraft
isLoading
authSession
index.tsx

Define navegação por stack principal com telas de cliente e admin.
Define rota inicial baseada em authSession.
Usa AdminTabsNavigator para área administrativa com abas.
Dados e modelo
Tipos
Product

id, nome, descrição, preço, duração.
Barber

id, nome, cor, instagram, multiplicador de preço, usuário, senha.
TimeSlot

id, barberId, date, time, isActive.
BookingRequest

id, clientName, phoneDD, phoneNumber, email, productId, barberId, slotId, additionalProductIds, status, createdAt.
BookingDraft

mesmo que request sem id, status e createdAt.
Banco de dados
No SUPABASE_SCHEMA.sql existem:

public.timeslots
id text PK
barber_id text
date date
time text
is_active boolean
unique(barber_id, date, time)
public.booking_requests
id text PK
client_name text
phone_dd text
phone_number text
email text
product_id text
barber_id text
slot_id text
additional_product_ids text[] default []
status text default 'pending'
created_at timestamptz default now()
check status in ('pending', 'approved', 'rejected')
Regras de segurança
Row Level Security ativado para timeslots e booking_requests.
Políticas públicas com using (true) e with check (true).
Integração Supabase
firebase.ts

SUPABASE_URL = 'https://fmutugzjppcpwwajmndk.supabase.co'
SUPABASE_ANON_KEY = 'sb_publishable_avQ8YoJ7k2levSdmgM1WVA_Z8F7Qipc'
Cria cliente Supabase com persistSession: false, autoRefreshToken: false.
storage.ts

Mapeia tabelas do Supabase para tipos do app.
Funções:
getRequests()
saveRequest(request)
updateRequestStatus(id, status)
updateRequestAdditionalProducts(id, additionalProductIds)
deleteRequest(id)
getTimeSlots()
saveTimeSlots(slots)
toggleSlotActive(slotId)
deactivateSlot(slotId)
deleteTimeSlot(slotId)
deleteTimeSlotsByDate(barberId, date)
clearDatabaseRecords()
addTimeSlot(slot)
Observação: não há persistência local de sessão em auth.ts.
Lógica do fluxo de cliente
1) Home
Tela inicial com botões:
Agendar agora → ClientInfo
Área administrativa → AdminLogin
2) ClientInfo
Captura:
clientName
phoneDD
phoneNumber
email
Validações:
Nome não vazio
DD com 2 dígitos
Número com 8-9 dígitos
Email válido
3) BarberSelection
Lista barbeiros (SEED_BARBERS)
Mostra quantidade de horários disponíveis por barbeiro
Seleciona barbeiro e limpa slotId
4) ProductSelection
Lista serviços (SEED_PRODUCTS)
Calcula preço ajustado por barber.priceMultiplier
Seleciona productId
5) ExtraProductsSelection
Lista adicionais permitidos por serviço via getAllowedAdditionalProductIds
O usuário escolhe extras com confirmação de alerta
Atualiza additionalProductIds
6) TimeSlotSelection
Mostra calendário com datas disponíveis
Usa getActiveSlotsForBarber(barberId):
slots ativos
não reservados
data >= hoje
Agrupa horários por data
Seleciona slotId
7) Confirmation
Exibe resumo:
Nome
Telefone
Email
Serviço, valor, barbeiro, data, horário
Envia chamada submitBooking()
Cria BookingRequest:
id: req-${Date.now()}
status: pending
createdAt: agora
Salva no Supabase
Redireciona para BookingSuccess
8) BookingSuccess
Tela de confirmação final
Botão volta para Home
Lógica administrativa
Admin login
AdminLoginScreen.tsx
Autentica:
admin fixo: admin/admin
barbeiros via SEED_BARBERS com username/password
Admin vai para AdminTabs
Barbeiro vai para BarberSchedule
AdminTabs
Aba Requests
Aba Schedule
RequestsScreen
Lista requests
Permite:
aprovar
recusar
excluir
exportar CSV
limpar banco de dados
editar adicionais do pedido
Calcula métricas:
receita total aprovada
ticket médio
ticket médio por barbeiro
horários de pico
fluxo de caixa por status
ScheduleScreen
Gerencia horários por barbeiro e data
Funções:
trocar barbeiro
selecionar data
marcar slot ativo/inativo
excluir horário
excluir dia inteiro
adicionar horário único
adicionar dia inteiro com PRESET_TIMES
Usa CalendarPicker para datas
Exibe lista de slots do dia
BarberScheduleScreen
Visão do barbeiro logado
Mostra métricas:
faturamento do dia
faturamento do mês
comissão (20%)
total de agendamentos aprovados
Exibe agenda de solicitações aprovadas por dia
Componentes reutilizáveis
Button.tsx

Botões primário, secundário, sucesso, danger
Suporta loading
SelectCard.tsx

Cartões selecionáveis
Título, descrição, subtítulo, ícone
CalendarPicker.tsx

Calendário mensal
Mostra dias habilitados
Permite seleção de data
Permite adição de data em admin
StepIndicator.tsx

Exibe passo atual no fluxo de reserva
Dados fixos / seed
seed.ts
Produtos (SEED_PRODUCTS)
Barbeiros (SEED_BARBERS)
Regras de adicionais (ADDITIONAL_PRODUCT_OPTIONS)
Credenciais admin
Geração de slots padrão (generateSeedTimeSlots)
Utilitários
format.ts
formatDate
formatPhone
formatPrice
isValidEmail
groupSlotsByDate
isValidTime
isValidDate
Pontos importantes para uma outra IA reconstruir o site
Fluxo do usuário

Cliente preenche dados → escolhe barbeiro → serviço → adicionais → horário → confirma.
Fluxo administrativo

Login admin/barbeiro → lista de solicitações → controle de status → gestão de horários.
Dados do backend

Mesmas tabelas e colunas do Supabase.
Mesmo layout de status.
Mesmos relacionamentos:
booking_requests.barber_id → barbers fixos
booking_requests.slot_id → timeslots.id
booking_requests.product_id → products fixos
timeslots.barber_id → barbers.id
Integração entre sistemas

Use o mesmo SUPABASE_URL e SUPABASE_ANON_KEY para site e app.
O site deve ler/gravar timeslots e booking_requests.
Barbeiros e produtos podem ser reimplementados como dados fixos ou migrados para DB.
Autenticação

Aqui é local e simples.
Se quiser integração real, transforme em autenticação de verdade com usuários no Supabase ou outro serviço.
Resumo para outra IA
O app é um sistema de agendamento de barbearia com duas frentes:

cliente que cria pedidos de agendamento
administração que gerencia pedidos e horários
Funções centrais:

CRUD de timeslots
CRUD de booking_requests
validação de dados do cliente
cálculo de valores e métricas
exportação CSV
UI de calendário e seleção passo a passo
O projeto não usa backend próprio além do Supabase e não persiste sessão de login entre execuções.