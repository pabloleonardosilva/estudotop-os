/**
 * ARQUIVO: Layout do PDF da OS
 * OBJETIVO: define PDF usado no download e no anexo do e-mail.
 * ONDE MEXER: campos, estilos, margens e rodapé.
 * CUIDADO: usa @react-pdf/renderer; não é HTML/Tailwind comum.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// Componente central do PDF. Alterações aqui impactam download e anexo do e-mail.
export default function OSDocument({ os }: any) {
  const professor = os.teachers?.name || os.professor_name || "-";
  const disciplina = os.subjects?.name || os.subject_name || "-";
  const operador = os.operator_name || "Não registrado";

  function nomeStatus(status: string) {
    if (status === "pendente") return "Pendente";
    if (status === "editando") return "Em edição";
    if (status === "concluido") return "Concluído";
    return status || "-";
  }

  function formatarData(data: string) {
    if (!data) return "-";

    return new Date(data).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>ESTUDOTOP OS</Text>
            <Text style={styles.title}>Ordem de Serviço</Text>
            <Text style={styles.subtitle}>Controle de produção audiovisual</Text>
          </View>

          <View style={styles.osBox}>
            <Text style={styles.osLabel}>Nº DA OS</Text>
            <Text style={styles.osNumber}>{os.os_number}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusBadge}>{nomeStatus(os.status)}</Text>
          <Text style={styles.dateText}>
            Emitido em {formatarData(new Date().toISOString())}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados principais</Text>

          <View style={styles.grid}>
            <Info label="Professor" value={professor} />
            <Info label="Disciplina" value={disciplina} />
            <Info label="Operador" value={operador} />
            <Info label="Data de envio" value={formatarData(os.created_at)} />
            <Info
              label="Data de conclusão"
              value={os.completed_at ? formatarData(os.completed_at) : "-"}
            />
            <Info label="Status" value={nomeStatus(os.status)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados da produção</Text>

          <View style={styles.grid}>
            <Info label="Quantidade de arquivos" value={os.file_count || 0} />
            <Info label="Tempo total" value={os.total_video_time || "-"} />
            <Info label="Tempo em minutos" value={os.total_video_minutes || 0} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link do Google Drive</Text>

          <View style={styles.textBox}>
            <Text style={styles.bodyText}>
              {os.drive_link || "Nenhum link informado."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>

          <View style={styles.notesBox}>
            <Text style={styles.bodyText}>
              {os.notes || "Nenhuma observação registrada."}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Sistema EstudoTOP OS</Text>
          <Text>{os.os_number}</Text>
        </View>
      </Page>
    </Document>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value || "-")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  header: {
    backgroundColor: "#080b12",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: 8,
    letterSpacing: 2.4,
    color: "#fb923c",
    fontWeight: "bold",
    marginBottom: 4,
  },

  title: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 8,
    color: "#cbd5e1",
  },

  osBox: {
    backgroundColor: "#f97316",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 88,
    alignItems: "center",
  },

  osLabel: {
    fontSize: 6,
    letterSpacing: 1.2,
    color: "#111827",
    fontWeight: "bold",
  },

  osNumber: {
    marginTop: 3,
    fontSize: 13,
    color: "#111827",
    fontWeight: "bold",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  statusBadge: {
    backgroundColor: "#ffedd5",
    color: "#9a3412",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 8,
    fontWeight: "bold",
  },

  dateText: {
    fontSize: 8,
    color: "#64748b",
  },

  section: {
    marginBottom: 9,
  },

  sectionTitle: {
    marginBottom: 5,
    fontSize: 8,
    letterSpacing: 1.4,
    color: "#f97316",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  infoItem: {
    width: "31.7%",
    minHeight: 42,
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
  },

  infoLabel: {
    marginBottom: 3,
    fontSize: 6.5,
    letterSpacing: 1,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  infoValue: {
    fontSize: 9,
    color: "#0f172a",
    fontWeight: "bold",
    lineHeight: 1.25,
  },

  textBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f8fafc",
    minHeight: 34,
  },

  notesBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#f8fafc",
    minHeight: 56,
    maxHeight: 86,
  },

  bodyText: {
    fontSize: 8.5,
    color: "#334155",
    lineHeight: 1.35,
  },

  footer: {
    marginTop: "auto",
    paddingTop: 7,
    borderTop: "1px solid #e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#94a3b8",
  },
});
