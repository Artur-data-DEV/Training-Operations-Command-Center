/**
 * Service Portal – Server-side ambient supplements.
 * 
 * Este arquivo NÃO usa 'import' ou 'export' no topo.
 */

// Referenciamos as classes do SDK para obter os membros estáticos e construtores
type _gs = typeof import('@servicenow/glide').gs;
type _GlideRecord = typeof import('@servicenow/glide').GlideRecord;
type _GlideRecordSecure = typeof import('@servicenow/glide').GlideRecordSecure;
type _GlideDateTime = typeof import('@servicenow/glide').GlideDateTime;

// Declaramos as variáveis globais que o ServiceNow injeta
declare var gs: _gs;
declare var GlideRecord: _GlideRecord;
declare var GlideRecordSecure: _GlideRecordSecure;
declare var GlideDateTime: _GlideDateTime;

// Globais específicas de Widget
declare var data: Record<string, any>;
declare var options: Record<string, any>;
declare var input: Record<string, any> | undefined;

// Contexto de Business Rules
declare var current: import('@servicenow/glide').GlideRecord;
declare var previous: import('@servicenow/glide').GlideRecord;

// Namespace do Projeto
declare namespace x_783010_tocc_a1 {
    class PortalApiService {
        getAvailableSessions(): string;
        getSessionDetail(): string;
        getMyEnrollments(): string;
        getMyReservations(): string;
        confirmMyAttendance(): string;
        cancelMyEnrollment(): string;
        getTrainingPolicies(): string;
        getHelpCenterContext(): string;
        getOperationsSnapshot(): string;
    }
}
