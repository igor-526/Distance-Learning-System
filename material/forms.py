from .models import Material, MaterialCategory
from django import forms


class MaterialCategoryForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'cat_field'

    class Meta:
        model = MaterialCategory
        fields = ('name',)


class MaterialForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        self.owner = kwargs.pop('owner', None)
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'material_input'

    # def save(self, commit=True):
    #     obj = super(MaterialForm, self).save(commit=False)
    #     obj.owner = self.owner
    #     if commit:
    #         obj.save()
    #     return obj

    class Meta:
        model = Material
        fields = ('name', 'category', 'file')
