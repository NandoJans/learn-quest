<?php

namespace App\Form\Type;

use App\Entity\Course;
use App\Subscriber\HashPasswordSubscriber;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\ColorType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class CourseType extends AbstractType
{
    public function __construct(
        private readonly HashPasswordSubscriber $subscriber
    )
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('code', TextType::class, [
                'label' => 'Code',
                'required' => true,
            ])
            ->add('name', TextType::class, [
                'label' => 'Course Name',
                'required' => true,
            ])
            ->add('description', TextareaType::class, [
                'label' => 'Course Description',
                'required' => false,
                'attr' => [
                    'rows' => 5,
                    'placeholder' => 'Enter a brief description of the course',
                ],
            ])
            ->add('faIcon', TextType::class, [
                'label' => 'Font Awesome Icon',
                'required' => true,
                'attr' => [
                    'placeholder' => 'e.g., fa-book',
                ],
            ])
            ->add('primaryColor', ColorType::class, [
                'label' => 'Primary Color',
                'required' => true,
                'attr' => [
                    'class' => 'color-picker',
                    'placeholder' => '#ffffff',
                ],
            ])
            ->add('lessons', CollectionType::class, [
                'entry_type' => LessonType::class,
                'entry_options' => [
                    'label' => false,
                ],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'prototype' => true,
            ]);

        $builder->addEventSubscriber($this->subscriber);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Course::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'course_item',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'course';
    }

}