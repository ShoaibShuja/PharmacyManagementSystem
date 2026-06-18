export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Database["public"]["Enums"]["app_role"];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      medicine_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      medicines: {
        Row: {
          id: string;
          brand_name: string;
          generic_name: string | null;
          dosage_form: string;
          strength: string | null;
          category_id: string | null;
          default_supplier_id: string | null;
          sku: string | null;
          barcode: string | null;
          unit: string;
          default_selling_price: number;
          default_cost_price: number;
          reorder_threshold: number;
          status: Database["public"]["Enums"]["record_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand_name: string;
          generic_name?: string | null;
          dosage_form: string;
          strength?: string | null;
          category_id?: string | null;
          default_supplier_id?: string | null;
          sku?: string | null;
          barcode?: string | null;
          unit?: string;
          default_selling_price?: number;
          default_cost_price?: number;
          reorder_threshold?: number;
          status?: Database["public"]["Enums"]["record_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          brand_name?: string;
          generic_name?: string | null;
          dosage_form?: string;
          strength?: string | null;
          category_id?: string | null;
          default_supplier_id?: string | null;
          sku?: string | null;
          barcode?: string | null;
          unit?: string;
          default_selling_price?: number;
          default_cost_price?: number;
          reorder_threshold?: number;
          status?: Database["public"]["Enums"]["record_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_batches: {
        Row: {
          id: string;
          medicine_id: string;
          supplier_id: string | null;
          purchase_order_item_id: string | null;
          batch_number: string;
          expiry_date: string;
          cost_price: number;
          selling_price: number;
          initial_quantity: number;
          current_quantity: number;
          received_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          supplier_id?: string | null;
          purchase_order_item_id?: string | null;
          batch_number: string;
          expiry_date: string;
          cost_price: number;
          selling_price: number;
          initial_quantity: number;
          current_quantity: number;
          received_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          supplier_id?: string | null;
          purchase_order_item_id?: string | null;
          batch_number?: string;
          expiry_date?: string;
          cost_price?: number;
          selling_price?: number;
          initial_quantity?: number;
          current_quantity?: number;
          received_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          sale_number: string;
          status: Database["public"]["Enums"]["sale_status"];
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          amount_paid: number;
          change_amount: number;
          payment_method: Database["public"]["Enums"]["payment_method"];
          cashier_id: string;
          completed_at: string | null;
          voided_at: string | null;
          voided_by: string | null;
          void_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sale_number: string;
          status?: Database["public"]["Enums"]["sale_status"];
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          change_amount?: number;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          cashier_id: string;
          completed_at?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
          void_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          sale_number?: string;
          status?: Database["public"]["Enums"]["sale_status"];
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          amount_paid?: number;
          change_amount?: number;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          completed_at?: string | null;
          voided_at?: string | null;
          voided_by?: string | null;
          void_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          medicine_id: string;
          inventory_batch_id: string | null;
          quantity: number;
          unit_price: number;
          cost_price_snapshot: number;
          discount_amount: number;
          line_total: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          medicine_id: string;
          inventory_batch_id?: string | null;
          quantity: number;
          unit_price: number;
          cost_price_snapshot?: number;
          discount_amount?: number;
          line_total: number;
          created_at?: string;
        };
        Update: {
          inventory_batch_id?: string | null;
          quantity?: number;
          unit_price?: number;
          cost_price_snapshot?: number;
          discount_amount?: number;
          line_total?: number;
        };
        Relationships: [];
      };
      purchase_orders: {
        Row: {
          id: string;
          order_number: string;
          supplier_id: string;
          status: Database["public"]["Enums"]["purchase_order_status"];
          expected_date: string | null;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total_amount: number;
          notes: string | null;
          created_by: string;
          ordered_at: string | null;
          received_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          supplier_id: string;
          status?: Database["public"]["Enums"]["purchase_order_status"];
          expected_date?: string | null;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          created_by: string;
          ordered_at?: string | null;
          received_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          order_number?: string;
          supplier_id?: string;
          status?: Database["public"]["Enums"]["purchase_order_status"];
          expected_date?: string | null;
          subtotal?: number;
          discount_amount?: number;
          tax_amount?: number;
          total_amount?: number;
          notes?: string | null;
          ordered_at?: string | null;
          received_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          medicine_id: string;
          ordered_quantity: number;
          received_quantity: number;
          unit_cost: number;
          intended_selling_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          medicine_id: string;
          ordered_quantity: number;
          received_quantity?: number;
          unit_cost: number;
          intended_selling_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ordered_quantity?: number;
          received_quantity?: number;
          unit_cost?: number;
          intended_selling_price?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      inventory_adjustments: {
        Row: {
          id: string;
          medicine_id: string;
          inventory_batch_id: string;
          adjustment_type: Database["public"]["Enums"]["inventory_adjustment_type"];
          quantity_change: number;
          reason: string;
          reference_type: string | null;
          reference_id: string | null;
          performed_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          medicine_id: string;
          inventory_batch_id: string;
          adjustment_type: Database["public"]["Enums"]["inventory_adjustment_type"];
          quantity_change: number;
          reason: string;
          reference_type?: string | null;
          reference_id?: string | null;
          performed_by: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      app_settings: {
        Row: {
          singleton: boolean;
          pharmacy_name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          currency_code: string;
          tax_rate: number;
          expiry_alert_days: number;
          default_reorder_threshold: number;
          receipt_footer: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          singleton?: boolean;
          pharmacy_name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          currency_code?: string;
          tax_rate?: number;
          expiry_alert_days?: number;
          default_reorder_threshold?: number;
          receipt_footer?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pharmacy_name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          currency_code?: string;
          tax_rate?: number;
          expiry_alert_days?: number;
          default_reorder_threshold?: number;
          receipt_footer?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      medicine_inventory_summary: {
        Row: {
          medicine_id: string | null;
          total_stock: number | null;
          saleable_stock: number | null;
          nearest_expiry_date: string | null;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin" | "pharmacist" | "cashier";
      record_status: "active" | "inactive";
      sale_status: "draft" | "completed" | "voided";
      payment_method: "cash" | "card" | "other";
      purchase_order_status:
        | "draft"
        | "ordered"
        | "partially_received"
        | "received"
        | "cancelled";
      inventory_adjustment_type:
        | "receive"
        | "increase"
        | "decrease"
        | "correction"
        | "sale"
        | "sale_void";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];
