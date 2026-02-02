import type { Schema, Struct } from '@strapi/strapi';

export interface MessageMessage extends Struct.ComponentSchema {
  collectionName: 'components_message_messages';
  info: {
    displayName: 'Message';
  };
  attributes: {
    text: Schema.Attribute.Text;
  };
}

export interface TextText extends Struct.ComponentSchema {
  collectionName: 'components_text_texts';
  info: {
    displayName: 'text';
  };
  attributes: {
    text: Schema.Attribute.Text;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'message.message': MessageMessage;
      'text.text': TextText;
    }
  }
}
