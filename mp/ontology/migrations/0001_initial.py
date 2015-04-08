# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Term'
        db.create_table(u'ontology_term', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=125)),
            ('slug', self.gf('django.db.models.fields.CharField')(max_length=125)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'ontology', ['Term'])

        # Adding M2M table for field parents on 'Term'
        m2m_table_name = db.shorten_name(u'ontology_term_parents')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('from_term', models.ForeignKey(orm[u'ontology.term'], null=False)),
            ('to_term', models.ForeignKey(orm[u'ontology.term'], null=False))
        ))
        db.create_unique(m2m_table_name, ['from_term_id', 'to_term_id'])


    def backwards(self, orm):
        # Deleting model 'Term'
        db.delete_table(u'ontology_term')

        # Removing M2M table for field parents on 'Term'
        db.delete_table(db.shorten_name(u'ontology_term_parents'))


    models = {
        u'ontology.term': {
            'Meta': {'object_name': 'Term'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '125'}),
            'parents': ('django.db.models.fields.related.ManyToManyField', [], {'blank': 'True', 'related_name': "'parents_rel_+'", 'null': 'True', 'to': u"orm['ontology.Term']"}),
            'slug': ('django.db.models.fields.CharField', [], {'max_length': '125'})
        }
    }

    complete_apps = ['ontology']