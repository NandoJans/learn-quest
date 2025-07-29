<?php

namespace App\Form\Type;

use App\Entity\Course;
use App\Entity\Lesson;
use App\Subscriber\HashPasswordSubscriber;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class LessonType extends AbstractType
{
    public function __construct(
        private readonly HashPasswordSubscriber $subscriber
    )
    {
    }

    public function buildForm(FormBuilderInterface $builder, array $options): void
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
            ]);

        $builder->addEventSubscriber($this->subscriber);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Lesson::class,
            'csrf_protection' => true,
            'csrf_field_name' => '_token',
            'csrf_token_id' => 'course_item',
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'lesson';
    }

}